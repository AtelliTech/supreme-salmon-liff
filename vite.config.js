import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import viteBasicSslPlugin from "@vitejs/plugin-basic-ssl";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pages = new Set([
  "/orders",
  "/orders/create",
  "/orders/detail",
  "/products",
  "/sign-up",
  "/pending",
]);

export default defineConfig({
  server: { https: true },
  plugins: [
    viteBasicSslPlugin(),
    {
      name: "clean-url",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const url = req.url;
          if (!url) return next();

          const [pathname, search] = url.split("?");

          if (
            req.headers.accept?.includes("text/html") &&
            pages.has(pathname)
          ) {
            const target = `${pathname}/index.html`;
            req.url = search ? `${target}?${search}` : target;
          }

          next();
        });
      },
    },
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        products: resolve(__dirname, "products/index.html"),
        "sign-up": resolve(__dirname, "sign-up/index.html"),
        pending: resolve(__dirname, "pending/index.html"),
        orders: resolve(__dirname, "orders/index.html"),
        "orders/create": resolve(__dirname, "orders/create/index.html"),
        "orders/detail": resolve(__dirname, "orders/detail/index.html"),
      },
    },
  },
});
