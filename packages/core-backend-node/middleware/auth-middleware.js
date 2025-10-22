import { PrismaClient } from "../prisma/generated/index.js";

const prisma = new PrismaClient();

/**
 * Just-In-Time user provisioning middleware
 * Translates Auth0 sub → internal user_id (creates if missing)
 * Updates lastSeenAt on every request
 */
export async function getOrCreateUserIdFromAuth0Sub(claims) {
  const sub = claims.sub; // from verified JWT
  const email = claims.email ?? null;
  const name = claims.name ?? null;

  try {
    const user = await prisma.user.upsert({
      where: { auth0Id: sub },
      update: {
        lastSeenAt: new Date(),
        // Optionally update other fields if they changed
        email: email || undefined,
        name: name || undefined,
      },
      create: {
        auth0Id: sub,
        email,
        name,
        lastSeenAt: new Date(),
      },
      select: { id: true },
    });

    return user.id; // your internal UUID
  } catch (error) {
    console.error("Error in JIT user provisioning:", error);
    throw error;
  }
}

/**
 * Express middleware that adds userId to req object
 */
export function authMiddleware() {
  return async (req, res, next) => {
    try {
      // Skip if no authenticated user
      if (!req.oidc?.user) {
        return next();
      }

      // Get or create user ID from Auth0 claims
      const userId = await getOrCreateUserIdFromAuth0Sub(req.oidc.user);

      // Add userId to request object
      req.userId = userId;

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(500).json({ error: "Authentication error" });
    }
  };
}
