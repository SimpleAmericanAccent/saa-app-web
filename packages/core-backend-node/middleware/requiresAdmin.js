/**
 * Middleware to require admin role
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requiresAdmin(req, res, next) {
  // Only enforce admin role if the user is authenticated
  if (!req.oidc?.isAuthenticated?.()) return next(); // Let Auth0 handle login

  const roles =
    req.oidc?.user?.["https://simpleamericanaccent.com/claims/roles"] || [];

  if (!roles.includes("admin")) {
    return res.status(403).send("Admins only.");
  }

  next();
}
