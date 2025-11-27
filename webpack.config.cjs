const path = require("path");

// added this file just to be able to run dependency-cruiser

module.exports = {
  resolve: {
    alias: {
      // Standard @ aliases
      "@": path.resolve(__dirname, "packages/frontend/src"),
      "@/components": path.resolve(
        __dirname,
        "packages/frontend/src/components"
      ),
      "@/lib": path.resolve(__dirname, "packages/frontend/src/lib"),
      "@/hooks": path.resolve(__dirname, "packages/frontend/src/hooks"),
      "@/utils": path.resolve(__dirname, "packages/frontend/src/utils"),
      "@/stores": path.resolve(__dirname, "packages/frontend/src/stores"),
      "@/data": path.resolve(__dirname, "packages/frontend/src/data"),
      "@/pages": path.resolve(__dirname, "packages/frontend/src/pages"),
      // Handle the frontend prefix pattern
      frontend: path.resolve(__dirname, "packages/frontend"),
      "frontend/src": path.resolve(__dirname, "packages/frontend/src"),
      "frontend/src/components": path.resolve(
        __dirname,
        "packages/frontend/src/components"
      ),
      "frontend/src/lib": path.resolve(__dirname, "packages/frontend/src/lib"),
      "frontend/src/hooks": path.resolve(
        __dirname,
        "packages/frontend/src/hooks"
      ),
      "frontend/src/utils": path.resolve(
        __dirname,
        "packages/frontend/src/utils"
      ),
      "frontend/src/stores": path.resolve(
        __dirname,
        "packages/frontend/src/stores"
      ),
      "frontend/src/data": path.resolve(
        __dirname,
        "packages/frontend/src/data"
      ),
      "frontend/src/pages": path.resolve(
        __dirname,
        "packages/frontend/src/pages"
      ),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts", ".json"],
  },
};
