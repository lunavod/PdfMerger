import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePluginFonts } from "vite-plugin-fonts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginFonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,900",
          },
        ],
      },
    }),
  ],
});
