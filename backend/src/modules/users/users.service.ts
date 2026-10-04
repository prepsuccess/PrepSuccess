import { prisma } from "../../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AppError } from "../../lib/http.js";
import { toAuthUser } from "../auth/auth.dto.js";
import { markOnboardingCompleteIfReady } from "../onboarding/onboarding.service.js";
import type { UpdateMeInput } from "./users.schemas.js";

const withProfile = { profile: true } as const;

/**
 * Updates the signed-in user's name and/or profile. Profile fields are merged
 * into `profile_data` — anything not sent (including keys written by the AI
 * onboarding) is kept, and `null` removes a key.
 *
 * The profile row is locked before it's read, so two PATCHes at once merge
 * one after the other instead of the second overwriting the first's keys.
 */
export async function updateMe(userId: string, input: UpdateMeInput) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM user_profiles WHERE user_id = ${userId}::uuid FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId }, include: withProfile });
    if (!user || !user.isActive || user.isDeleted) {
      throw new AppError(401, "UNAUTHORIZED", "Sign in to continue.");
    }

    let profile: Prisma.UserUpdateInput["profile"];
    if (input.profile) {
      const current = user.profile?.profileData;
      const merged: Record<string, unknown> =
        current && typeof current === "object" && !Array.isArray(current) ? { ...current } : {};
      for (const [key, value] of Object.entries(input.profile)) {
        if (value === null) delete merged[key];
        else if (value !== undefined) merged[key] = value;
      }
      const profileData = merged as Prisma.InputJsonObject;
      profile = { upsert: { create: { profileData }, update: { profileData } } };
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        ...(input.first_name !== undefined ? { firstName: input.first_name } : {}),
        ...(input.last_name !== undefined ? { lastName: input.last_name || null } : {}),
        ...(profile ? { profile } : {}),
      },
      include: withProfile,
    });
    // Filling the last required field on the profile page finishes onboarding too.
    if (profile && updated.profile && !updated.profile.onboardingCompletedAt) {
      const completedAt = await markOnboardingCompleteIfReady(tx, userId, updated.profile);
      if (completedAt) {
        return toAuthUser({
          ...updated,
          profile: { ...updated.profile, onboardingCompletedAt: completedAt },
        });
      }
    }
    return toAuthUser(updated);
  });
}
