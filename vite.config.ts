import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Hämta nyckeln från .env (VITE_GEMINI_API_KEY eller GEMINI_API_KEY)
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || "";

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      // Dessa ersätts med själva strängen vid build i Vite
      "process.env.GEMINI_API_KEY": JSON.stringify(geminiKey),
      "process.env.VITE_GEMINI_API_KEY": JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
