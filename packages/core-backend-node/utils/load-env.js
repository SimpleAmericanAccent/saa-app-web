import fs from "fs";
import path from "path";
import url from "url";

export function loadAppAndSharedEnv(importMetaUrl) {
  const flag = process.env.ENVIRONMENT_FLAG ?? "";
  if (flag.toLowerCase() === "prod" || flag.toLowerCase() === "production") {
    console.log("\nSkipping .env file loading since this is PROD environment");
    return;
  }

  console.log("\nLoading .env files for DEV environment");

  const appDir = path.dirname(url.fileURLToPath(importMetaUrl));
  const sharedEnv = path.resolve(
    appDir,
    "../../packages/core-backend-node/.env"
  );
  const appEnv = path.resolve(appDir, ".env");

  let i = 0;

  [sharedEnv, appEnv].forEach((file) => {
    let logString = `Looking for ${
      i === 0 ? "shared" : "app"
    } .env at: ${file}`;

    if (!fs.existsSync(file)) {
      logString += ` | ❌ Not found`;
      console.warn(logString);
      return;
    }
    fs.readFileSync(file, "utf8")
      .split("\n")
      .forEach((line) => {
        if (!line || line.startsWith("#")) return;
        const [k, ...v] = line.split("=");
        if (!k || k in process.env) return;
        process.env[k] = v
          .join("=")
          .trim()
          .replace(/^['"]|['"]$/g, "");
      });
    logString += ` | ✅ Loaded`;
    console.log(logString);
    i++;
  });
}
