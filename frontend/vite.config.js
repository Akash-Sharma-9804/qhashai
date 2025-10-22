
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
  
//   base: "/Quantum_AI/", // Ensures proper asset linking
//   build: {
//     outDir: "dist",
//     assetsDir: "assets",
//     assetsInlineLimit: 0, // Ensure images are not inlined
//     rollupOptions: {
//       output: {
//         entryFileNames: "assets/[name].js",
//         chunkFileNames: "assets/[name].js",
//         assetFileNames: "assets/[name].[ext]"
//       }

//     },
//     chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes('node_modules')) {
//             return id.split('node_modules/')[1].split('/')[0];
//           }
//         }
//       }
//     }
//   },
//   optimizeDeps: {
//     include: ['pdfjs-dist']
//   },
// });



// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   base: "/Quantum_AI/",
//   build: {
//     outDir: "dist",
//     assetsDir: "assets",
//     assetsInlineLimit: 0,
//     chunkSizeWarningLimit: 1000,
//     rollupOptions: {
//       output: {
//         entryFileNames: "assets/[name].js",
//         chunkFileNames: "assets/[name].js",
//         assetFileNames: "assets/[name].[ext]",
//         manualChunks(id) {
//           if (id.includes("node_modules")) {
//             return id.split("node_modules/")[1].split("/")[0];
//           }
//         }
//       }
//     }
//   },
//   optimizeDeps: {
//     include: ["pdfjs-dist/legacy/build/pdf.worker.min.js"]
//   }
// });



import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/", // make sure this matches your actual deployment path
  server: {
    host: 'localhost',
    port: 5174,
    strictPort: true, // This will fail if port 5174 is already in use
    // open: true // This will automatically open the browser
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.split("node_modules/")[1].split("/")[0];
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      // "pdfjs-dist/legacy/build/pdf.worker.min.js",
       
      "remark-gfm",
      "rehype-raw"
    ]
    
  }
});
