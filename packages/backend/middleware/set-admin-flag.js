export function setAdminFlag(req, res, next) {
  const roles =
    req.oidc?.user?.["https://simpleamericanaccent.com/claims/roles"] || [];
  req.isAdmin = roles.includes("admin");
  next();
}
