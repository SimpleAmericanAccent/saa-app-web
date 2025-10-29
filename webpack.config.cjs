const path = require("path");

// added this file just to be able to run dependency-cruiser

module.exports = {
  resolve: {
    alias: {
      // Standard @ aliases
      "@": path.resolve(__dirname, "packages/core-frontend-web/src"),
      "@/components": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/components"
      ),
      "@/lib": path.resolve(__dirname, "packages/core-frontend-web/src/lib"),
      "@/hooks": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/hooks"
      ),
      "@/utils": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/utils"
      ),
      "@/stores": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/stores"
      ),
      "@/data": path.resolve(__dirname, "packages/core-frontend-web/src/data"),
      "@/pages": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/pages"
      ),
      // Handle the core-frontend-web prefix pattern
      "core-frontend-web": path.resolve(
        __dirname,
        "packages/core-frontend-web"
      ),
      "core-frontend-web/src": path.resolve(
        __dirname,
        "packages/core-frontend-web/src"
      ),
      "core-frontend-web/src/components": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/components"
      ),
      "core-frontend-web/src/lib": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/lib"
      ),
      "core-frontend-web/src/hooks": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/hooks"
      ),
      "core-frontend-web/src/utils": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/utils"
      ),
      "core-frontend-web/src/stores": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/stores"
      ),
      "core-frontend-web/src/data": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/data"
      ),
      "core-frontend-web/src/pages": path.resolve(
        __dirname,
        "packages/core-frontend-web/src/pages"
      ),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts", ".json"],
  },
};
