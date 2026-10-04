import bcrypt from "bcryptjs";

import { prisma } from "../../db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { generateOtp, hashSecret, safeEqual } from "../../lib/crypto.js";
import { AppError } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { sendOtpEmail } from "../../services/email/email.service.js";
import {
  notify,
  type NewNotification,
} from "../../services/notifications/notifications.service.js";
import { toAuthUser } from "./auth.dto.js";
import type { GoogleIdentity } from "./google.client.js";
import type { LoginInput, RegisterInput, ResetPasswordInput } from "./auth.schemas.js";
import { issueTokens } from "./tokens.js";

// Flow details: docs/SYSTEM_ARCHITECTURE_FLOW.md §3.
const BCRYPT_ROUNDS = 12;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 3;
const OTP_RESEND_SECONDS = 60;
/** A just-rotated refresh token replayed within this window is a second tab, not a thief. */
const REFRESH_RACE_GRACE_MS = 60_000;

// Compared against when the email doesn't exist, so a login for an unknown
// account takes as long as one with a wrong password (no user enumeration).
const DUMMY_HASH = bcrypt.hashSync("prepsuccess-timing-guard", BCRYPT_ROUNDS);

const withProfile = { profile: true } as const;

const WELCOME: NewNotification = {
  type: "WELCOME",
  title: "Welcome to PrepSuccess",
  body: "Start with a short chat so your skill checks match your skills and target role.",
  href: "/onboarding",
};

type OtpPurpose = "SIGNUP" | "PASSWORD_RESET";

/** OTP codes are hashed together with the email they were sent to. */
const hashOtp = (email: string, code: string) => hashSecret(`otp:${email}:${code}`);

/** True when a code for this email + purpose went out less than a minute ago. */
async function recentlySent(email: string, purpose: OtpPurpose) {
  const latest = await prisma.emailOtp.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return Boolean(latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_SECONDS * 1000);
}

/** Stores a fresh code (only the newest one is valid) and returns it with its row id. */
async function storeOtp(email: string, purpose: OtpPurpose) {
  const code = generateOtp();
  const [, created] = await prisma.$transaction([
    prisma.emailOtp.updateMany({
      where: { email, purpose, isUsed: false },
      data: { isUsed: true },
    }),
    prisma.emailOtp.create({
      data: {
        email,
        purpose,
        otpHash: hashOtp(email, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      },
      select: { id: true },
    }),
  ]);
  return { id: created.id, code };
}

const tooManyAttempts = () =>
  new AppError(400, "OTP_TOO_MANY_ATTEMPTS", "Too many wrong attempts. Request a new code.");

/**
 * Checks a code against the newest unused one for this email + purpose. A
 * wrong code uses up an attempt; the third wrong one burns the code. A right
 * code isn't consumed here — consumeOtp does that inside the transaction
 * that acts on it.
 *
 * The attempt is claimed atomically before comparing, so parallel guesses
 * can't all read "0 attempts used" and get more than OTP_MAX_ATTEMPTS tries.
 */
async function checkOtp(email: string, purpose: OtpPurpose, code: string) {
  const otp = await prisma.emailOtp.findFirst({
    where: { email, purpose, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError(400, "OTP_INVALID", "That code isn't valid. Request a new one.");
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "OTP_EXPIRED", "That code has expired. Request a new one.");
  }

  const claimed = await prisma.emailOtp.updateMany({
    where: { id: otp.id, isUsed: false, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (claimed.count === 0) throw tooManyAttempts();

  if (safeEqual(otp.otpHash, hashOtp(email, code))) {
    // A right code doesn't count against them (it matters if what follows fails).
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { decrement: 1 } },
    });
    return otp;
  }

  // Burn the code once the last attempt is used, then report what's left.
  await prisma.emailOtp.updateMany({
    where: { id: otp.id, attempts: { gte: OTP_MAX_ATTEMPTS } },
    data: { isUsed: true },
  });
  const current = await prisma.emailOtp.findUnique({
    where: { id: otp.id },
    select: { attempts: true },
  });
  const left = Math.max(0, OTP_MAX_ATTEMPTS - (current?.attempts ?? OTP_MAX_ATTEMPTS));
  throw new AppError(
    400,
    "OTP_INVALID",
    left > 0
      ? `That code isn't right. ${left} attempt${left === 1 ? "" : "s"} left.`
      : "Too many wrong attempts. Request a new code.",
  );
}

/** Marks a checked code used, atomically, so two concurrent requests can't both use it. */
async function consumeOtp(tx: Prisma.TransactionClient, otpId: string) {
  const consumed = await tx.emailOtp.updateMany({
    where: { id: otpId, isUsed: false },
    data: { isUsed: true },
  });
  if (consumed.count !== 1) {
    throw new AppError(400, "OTP_INVALID", "That code has already been used. Request a new one.");
  }
}

/**
 * POST /auth/send-otp. Unlike forgot-password this answers 409 for a
 * registered email — accepted on purpose: signup has to tell people to log in
 * instead, and the endpoint is rate limited. The email is sent before
 * answering so a failure can be reported (503) and retried straight away.
 */
export async function sendSignupOtp(email: string) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "This email is already registered. Log in instead.",
    );
  }
  if (await recentlySent(email, "SIGNUP")) {
    throw new AppError(
      429,
      "OTP_RECENTLY_SENT",
      `Please wait ${OTP_RESEND_SECONDS} seconds before requesting a new code.`,
    );
  }

  const otp = await storeOtp(email, "SIGNUP");
  try {
    await sendOtpEmail(email, otp.code, OTP_TTL_MINUTES, "SIGNUP");
  } catch (error) {
    logger.error({ err: error, purpose: "SIGNUP" }, "OTP email failed");
    // Drop the undelivered code so the resend cooldown doesn't block a retry.
    await prisma.emailOtp.delete({ where: { id: otp.id } }).catch(() => {});
    throw new AppError(
      503,
      "EMAIL_SEND_FAILED",
      "We couldn't send the code right now. Please try again.",
    );
  }
  return { message: `We sent a 6-digit code to ${email}.`, email };
}

export async function register(input: RegisterInput) {
  const otp = await checkOtp(input.email, "SIGNUP", input.otp);
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      await consumeOtp(tx, otp.id);

      const user = await tx.user.create({
        data: {
          firstName: input.first_name,
          lastName: input.last_name || null,
          email: input.email,
          passwordHash,
          authProvider: "LOCAL",
          isVerified: true,
          lastLoginAt: new Date(),
          profile: {
            create: {
              profileData: input.student_year ? { student_year: input.student_year } : {},
            },
          },
        },
        include: withProfile,
      });

      return { ...(await issueTokens(user.id, user.role, tx)), user: toAuthUser(user) };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(
        409,
        "EMAIL_ALREADY_REGISTERED",
        "This email is already registered. Log in instead.",
      );
    }
    throw error;
  }

  await notify(result.user.id, WELCOME);
  return result;
}

/**
 * POST /auth/forgot-password. Answers the same way whether or not the email
 * has an account (and inside the resend cooldown), so it can't be used to
 * find out who's registered. Only active accounts are sent a code.
 *
 * The email isn't awaited: SMTP latency or a failure would otherwise show
 * which addresses have an account. A failed send is only logged; the code
 * row stays, so asking again after the cooldown sends a fresh one.
 */
export async function sendPasswordResetOtp(email: string) {
  const response = {
    message: `If ${email} has a PrepSuccess account, we sent a 6-digit code to it.`,
    email,
  };
  const [user, cooling] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { isActive: true, isDeleted: true } }),
    recentlySent(email, "PASSWORD_RESET"),
  ]);
  if (!user || !user.isActive || user.isDeleted || cooling) return response;

  const otp = await storeOtp(email, "PASSWORD_RESET");
  void sendOtpEmail(email, otp.code, OTP_TTL_MINUTES, "PASSWORD_RESET").catch((error: unknown) =>
    logger.error({ err: error, purpose: "PASSWORD_RESET" }, "OTP email failed"),
  );
  return response;
}

/**
 * POST /auth/reset-password. Sets the new password, signs every existing
 * session out, and signs this one in. A Google-only account gains a password
 * this way — safe, because the code proves control of the email.
 */
export async function resetPassword(input: ResetPasswordInput) {
  const otp = await checkOtp(input.email, "PASSWORD_RESET", input.otp);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.isDeleted || !user.isActive) {
    throw new AppError(400, "OTP_INVALID", "That code isn't valid. Request a new one.");
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    await consumeOtp(tx, otp.id);
    const updated = await tx.user.update({
      where: { id: user.id },
      data: { passwordHash, isVerified: true, lastLoginAt: new Date() },
      include: withProfile,
    });
    // Every other session ends; this one gets fresh tokens below.
    await tx.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: "password_reset" },
    });
    return { ...(await issueTokens(updated.id, updated.role, tx)), user: toAuthUser(updated) };
  });

  await notify(user.id, {
    type: "PASSWORD_CHANGED",
    title: "Your password was changed",
    body: "You were signed out on your other devices. If this wasn't you, reset your password again and contact us.",
  });
  return result;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: withProfile,
  });

  const passwordOk = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || user.isDeleted || !user.passwordHash || !passwordOk) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }
  if (!user.isActive) {
    throw new AppError(403, "ACCOUNT_DEACTIVATED", "This account has been deactivated.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ...(await issueTokens(user.id, user.role)), user: toAuthUser(user) };
}

const sessionExpired = () =>
  new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Sign in again.");
const refreshRace = () =>
  new AppError(409, "REFRESH_RACE", "Your session was just refreshed in another tab. Try again.");

/**
 * Rotates a refresh token. What happens to an already-revoked token depends on
 * why it was revoked (refresh_tokens.revoke_reason):
 *   - rotated < 60s ago → another tab refreshed at the same moment: 409, nothing revoked
 *   - rotated longer ago → replayed, likely stolen: every session of the user is revoked
 *   - logout / password reset / admin / reuse → just 401
 */
export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashSecret(refreshToken) },
    include: { user: { include: withProfile } },
  });

  if (!stored) throw sessionExpired();
  if (stored.revokedAt) {
    if (stored.revokeReason === "rotated") {
      if (Date.now() - stored.revokedAt.getTime() < REFRESH_RACE_GRACE_MS) throw refreshRace();
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: "reuse" },
      });
    }
    throw sessionExpired();
  }
  if (stored.expiresAt.getTime() < Date.now() || !stored.user.isActive || stored.user.isDeleted) {
    throw sessionExpired();
  }

  return prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: "rotated" },
    });
    // Another request rotated it between our read and this write.
    if (revoked.count !== 1) throw refreshRace();
    return {
      ...(await issueTokens(stored.userId, stored.user.role, tx)),
      user: toAuthUser(stored.user),
    };
  });
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashSecret(refreshToken), revokedAt: null },
    data: { revokedAt: new Date(), revokeReason: "logout" },
  });
  return { message: "Signed out." };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: withProfile });
  if (!user || !user.isActive || user.isDeleted) {
    throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
  }
  return toAuthUser(user);
}

/**
 * Google sign-in (SYSTEM_ARCHITECTURE_FLOW §3.2), given an identity whose ID
 * token was already verified:
 *   1. a user with this google_id exists → log in
 *   2. a user with this email exists → link Google to that account (safe because
 *      Google has verified the email), then log in
 *   3. otherwise → create a GOOGLE user with an empty profile for onboarding
 */
export async function loginWithGoogle(identity: GoogleIdentity) {
  if (!identity.emailVerified) {
    throw new AppError(403, "GOOGLE_EMAIL_UNVERIFIED", "Your Google email isn't verified.");
  }

  let user = await prisma.user.findUnique({
    where: { googleId: identity.googleId },
    include: withProfile,
  });

  if (!user) {
    const byEmail = await prisma.user.findUnique({
      where: { email: identity.email },
      include: withProfile,
    });

    if (byEmail) {
      // Checked before linking, so a deactivated account isn't modified.
      if (byEmail.isDeleted || !byEmail.isActive) {
        throw new AppError(403, "ACCOUNT_DEACTIVATED", "This account has been deactivated.");
      }
      if (byEmail.googleId && byEmail.googleId !== identity.googleId) {
        throw new AppError(
          409,
          "GOOGLE_ACCOUNT_CONFLICT",
          "This email is linked to a different Google account.",
        );
      }
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: identity.googleId,
          isVerified: true,
          profileImageUrl: byEmail.profileImageUrl ?? identity.picture,
        },
        include: withProfile,
      });
    } else {
      try {
        user = await prisma.user.create({
          data: {
            firstName: (identity.firstName || identity.email.split("@")[0]!).slice(0, 100),
            lastName: identity.lastName?.slice(0, 100) || null,
            email: identity.email,
            googleId: identity.googleId,
            authProvider: "GOOGLE",
            isVerified: true,
            profileImageUrl: identity.picture,
            profile: { create: {} },
          },
          include: withProfile,
        });
      } catch (error) {
        // Two callbacks for the same new account racing each other.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          throw new AppError(409, "GOOGLE_ACCOUNT_CONFLICT", "Please try signing in again.");
        }
        throw error;
      }
      await notify(user.id, WELCOME);
    }
  }

  if (user.isDeleted || !user.isActive) {
    throw new AppError(403, "ACCOUNT_DEACTIVATED", "This account has been deactivated.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ...(await issueTokens(user.id, user.role)), user: toAuthUser(user) };
}
