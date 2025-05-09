/**
 * Middleware to require admin role
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requiresAdmin(req, res, next) {
  const isAuthenticated = req.oidc?.isAuthenticated?.();
  const roles =
    req.oidc?.user?.["https://simpleamericanaccent.com/claims/roles"] || [];

  if (!isAuthenticated || roles.includes("admin")) {
    return next(); // ✅ Allow access if authenticated and admin
  }

  const isDev = process.env.ENVIRONMENT_FLAG === "dev";
  const userAppUrl = isDev
    ? "https://localhost:5173"
    : "https://app.simpleamericanaccent.com";

  res.status(403).type("html").send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Admins Only</title>
          <style>
            body {
              font-family: sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
              background: #f9f9f9;
              color: #333;
            }
            a {
              margin-top: 12px;
              display: inline-block;
              color: #0070f3;
              text-decoration: none;
              font-weight: bold;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>Admins Only</h1>
          <p>This area is restricted to users with admin access.</p>
          <a href="/logout">Change User</a>
          <a href="${userAppUrl}">Access User App</a>
        </body>
      </html>
    `);
}
