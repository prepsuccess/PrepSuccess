import bcrypt from "bcryptjs";

import { prisma } from "../../db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { generateOtp, hashSecret, safeEqual } from "../../lib/crypto.js";
import { AppError } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { sendOtpEmail } from "../../services/email/email.service.js";
import { toAuthUser } from "./auth.dto.js";
import type { GoogleIdentity } from "./google.client.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import { issueTokens } from "./tokens.js";

// Flow details: docs/SYSTEM_ARCHITECTURE_FLOW.md §3.
const BCRYPT_ROUNDS = 12;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 3;
const OTP_RESEND_SECONDS = 60;

// Compared against when the email doesn't exist, so a login for an unknown
// account takes as long as one with a wrong password (no user enumeration).
const DUMMY_HASH = bcrypt.hashSync("prepsuccess-timing-guard", BCRYPT_ROUNDS);

const withProfile = { profile: true } as const;

/** OTP codes are hashed together with the email they were sent to. */
const hashOtp = (email: string, code: string) => hashSecret(`otp:${email}:${code}`);

export async function sendSignupOtp(email: string) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "This email is already registered. Log in instead.",
    );
  }

  const latest = await prisma.emailOtp.findFirst({
    where: { email, purpose: "SIGNUP" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_SECONDS * 1000) {
    throw new AppError(
      429,
      "OTP_RECENTLY_SENT",
      `Please wait ${OTP_RESEND_SECONDS} seconds before requesting a new code.`,
    );
  }

  const code = generateOtp();
  const [, created] = await prisma.$transaction([
    // Only the newest code is valid.
    prisma.emailOtp.updateMany({
      where: { email, purpose: "SIGNUP", isUsed: false },
      data: { isUsed: true },
    }),
    prisma.emailOtp.create({
      data: {
        email,
        purpose: "SIGNUP",
        otpHash: hashOtp(email, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
      },
      select: { id: true },
    }),
  ]);

  try {
    await sendOtpEmail(email, code, OTP_TTL_MINUTES);
  } catch (error) {
    logger.error({ err: error }, "OTP email failed");
    // Drop the undelivered code so the resend cooldown doesn't block a retry.
    await prisma.emailOtp.delete({ where: { id: created.id } }).catch(() => {});
    throw new AppError(
      503,
      "EMAIL_SEND_FAILED",
      "We couldn't send the code right now. Please try again.",
    );
  }

  return { message: `We sent a 6-digit code to ${email}.`, email };
}

export async function register(input: RegisterInput) {
  const otp = await prisma.emailOtp.findFirst({
    where: { email: input.email, purpose: "SIGNUP", isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError(400, "OTP_INVALID", "That code isn't valid. Request a new one.");
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "OTP_EXPIRED", "That code has expired. Request a new one.");
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(
      400,
      "OTP_TOO_MANY_ATTEMPTS",
      "Too many wrong attempts. Request a new code.",
    );
  }
  if (!safeEqual(otp.otpHash, hashOtp(input.email, input.otp))) {
    const attempts = otp.attempts + 1;
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts, ...(attempts >= OTP_MAX_ATTEMPTS ? { isUsed: true } : {}) },
    });
    const left = OTP_MAX_ATTEMPTS - attempts;
    throw new AppError(
      400,
      "OTP_INVALID",
      left > 0
        ? `That code isn't right. ${left} attempt${left === 1 ? "" : "s"} left.`
        : "Too many wrong attempts. Request a new code.",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    return await prisma.$transaction(async (tx) => {
      // Consume the code atomically so two concurrent requests can't both use it.
      const consumed = await tx.emailOtp.updateMany({
        where: { id: otp.id, isUsed: false },
        data: { isUsed: true },
      });
      if (consumed.count !== 1) {
        throw new AppError(
          400,
          "OTP_INVALID",
          "That code has already been used. Request a new one.",
        );
      }

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

/** Rotates a refresh token. Reusing an already-rotated token revokes every session of that user. */
export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashSecret(refreshToken) },
    include: { user: { include: withProfile } },
  });

  if (!stored) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Sign in again.");
  }
  if (stored.revokedAt) {
    // A revoked token being replayed means it was likely stolen.
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Sign in again.");
  }
  if (stored.expiresAt.getTime() < Date.now() || !stored.user.isActive || stored.user.isDeleted) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Sign in again.");
  }

  return prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Sign in again.");
    }
    return {
      ...(await issueTokens(stored.userId, stored.user.role, tx)),
      user: toAuthUser(stored.user),
    };
  });
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashSecret(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
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
    }
  }

  if (user.isDeleted || !user.isActive) {
    throw new AppError(403, "ACCOUNT_DEACTIVATED", "This account has been deactivated.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ...(await issueTokens(user.id, user.role)), user: toAuthUser(user) };
}
