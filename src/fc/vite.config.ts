import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "public"),
  server: {
    port: 3030,
    watch: {
      usePolling: true,
    },
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(__dirname, "dist"),
    // assetsDir: '',
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        main: resolve(__dirname, "src/main/main.html"),
        content: resolve(__dirname, "src/content/content.ts"),
        // options: resolve(__dirname, 'src', 'options/options.html')
      },
      output: {
        // assetFileNames: (assetInfo) => {
        //   console.log(assetInfo, 111111);
        //   // let extType = assetInfo.name.split('.').at(1);

        //   // return assetInfo.name;
        //   return `assets/[name]-[hash][extname]`.replace('/src', '');
        //   // return `assets/${extType}/[name]-[hash][extname]`;

        // },
        //   let extType = assetInfo.name.split('.').at(1);
        //   if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
        //     extType = 'img';
        //   }
        //   return `assets/${extType}/[name]-[hash][extname]`;
        // },
        chunkFileNames: "[name]/[name].js",
        entryFileNames: "[name]/[name].js",
      },
    },
  },
});
