import angular from "@analogjs/vite-plugin-angular"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import react from "@vitejs/plugin-react"
import vue from "@vitejs/plugin-vue"
import solid from "@solidjs/vite-plugin"
import tailwind from "@tailwindcss/vite"
import { createFilter, defineConfig } from "vite"
import { ssrFixtures } from "./ssr-plugin"
import { solidSsr } from "./solid-ssr.ts"

// Solid and React both compile .tsx, so each plugin takes its own files.
const solidFiles = [
  "**/packages/solid/**",
  "**/fixtures/*/solid*.tsx",
  "**/examples/*/solid/**",
  "**/examples/components/*/solid/**",
]

const angularFiles = ["**/packages/angular/**", "**/fixtures/*/angular*.ts"]
const isAngularFile = createFilter(angularFiles)

export default defineConfig({
  // The Angular plugin turns Vite's TypeScript transform off for every file
  // unless the config sets `oxc`. It stays on, and leaves Angular's files alone.
  oxc: { exclude: angularFiles },
  plugins: [
    angular({
      tsconfig: "tsconfig.angular.json",
      transformFilter: (_code, id) => isAngularFile(id),
    }),
    react({ exclude: solidFiles }),
    vue(),
    svelte(),
    solid({ include: solidFiles, ssr: true }),
    solidSsr(),
    tailwind(),
    ssrFixtures(),
  ],
})
