import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    // 添加这个配置来忽略 TypeScript 错误
    esbuild: {
        ignoreAnnotations: true,
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: "@use \"@/styles/variables.scss\" as *;",
            },
        },
    },
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
            },
        },
    },
});
