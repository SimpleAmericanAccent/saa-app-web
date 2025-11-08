import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Define all .env.example locations
const envFiles = [
  {
    example: path.join(rootDir, "packages/core-frontend-web/.env.example"),
    target: path.join(rootDir, "packages/core-frontend-web/.env"),
    label: "Shared frontend",
  },
  {
    example: path.join(rootDir, "packages/core-backend-node/.env.example"),
    target: path.join(rootDir, "packages/core-backend-node/.env"),
    label: "Shared backend",
  },
  {
    example: path.join(rootDir, "apps/admin-backend-node/.env.example"),
    target: path.join(rootDir, "apps/admin-backend-node/.env"),
    label: "Admin backend",
  },
  {
    example: path.join(rootDir, "apps/user-backend-node/.env.example"),
    target: path.join(rootDir, "apps/user-backend-node/.env"),
    label: "User backend",
  },
];

console.log("\n🔧 Setting up environment files...\n");

const results = [];

envFiles.forEach(({ example, target, label }) => {
  const relativePath = path.relative(rootDir, target);
  let status, icon, message;

  // Check if .env already exists
  if (fs.existsSync(target)) {
    status = "skipped";
    icon = "⏭️";
    message = "Already exists";
  }
  // Check if .env.example exists
  else if (!fs.existsSync(example)) {
    status = "missing";
    icon = "⚠️";
    message = ".env.example not found";
  }
  // Copy .env.example to .env
  else {
    try {
      fs.copyFileSync(example, target);
      status = "created";
      icon = "✅";
      message = "Created from .env.example";
    } catch (error) {
      status = "error";
      icon = "❌";
      message = `Failed: ${error.message}`;
    }
  }

  results.push({ label, relativePath, icon, message, status });
});

// Show consolidated summary
const created = results.filter((r) => r.status === "created").length;
const skipped = results.filter((r) => r.status === "skipped").length;
const missing = results.filter((r) => r.status === "missing").length;
const errors = results.filter((r) => r.status === "error").length;

console.log(`📁 Environment files (${results.length} total):\n`);
results.forEach(({ label, relativePath, icon, message }) => {
  console.log(`   ${icon}  ${relativePath} (${label}) - ${message}`);
});

console.log(
  `\n📊 Summary: ${created} created, ${skipped} skipped, ${missing} missing examples${
    errors > 0 ? `, ${errors} errors` : ""
  }\n`
);

if (created > 0) {
  console.log(
    "💡 Remember to fill in your actual credentials in the .env files!\n"
  );
}
