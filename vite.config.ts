import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({  
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        ecommerce: resolve(import.meta.dirname, "ecommerce/index.html"),
        apiPlayground: resolve(import.meta.dirname, "api-playground/index.html"),
      },
    },
  },
})
