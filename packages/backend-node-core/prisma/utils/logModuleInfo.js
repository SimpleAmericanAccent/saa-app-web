import { fileURLToPath } from "url";
import { dirname } from "path";

export function logModuleInfo(metaUrl, label = "Module loaded") {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);
  console.info(`🛠️  ${label} in ${__dirname}`);
}
