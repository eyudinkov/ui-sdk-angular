// Builds an Angular package in the current directory into `dist` with ngc in
// partial mode, then checks the published manifest, as build-package.mjs does.
//   node ../../scripts/build/build-angular-package.mjs
import { execFileSync } from "node:child_process"
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { findPublishProblems } from "./publish-manifest.mjs"
import { isRelative, withJsExtension } from "./specifiers.mjs"

const packageDir = process.cwd()
const sourceDir = path.join(packageDir, "src")
const outDir = path.join(packageDir, "dist")
rmSync(outDir, { recursive: true, force: true })

const require = createRequire(path.join(packageDir, "package.json"))
const compilerCli = require.resolve("@angular/compiler-cli/package.json")
const ngc = path.join(path.dirname(compilerCli), require(compilerCli).bin.ngc)
// Emit settings live here, as in declarations.mjs, so the package keeps one
// `tsconfig.json` that typechecks with `noEmit`.
const emitFlags = [
  "--noEmit",
  "false",
  "--declaration",
  "--allowImportingTsExtensions",
  "false",
]
const paths = ["--rootDir", sourceDir, "--outDir", outDir]
execFileSync(
  process.execPath,
  [ngc, "-p", "tsconfig.json", ...emitFlags, ...paths],
  { cwd: packageDir, stdio: "inherit" }
)

const specifier = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\2/g
for (const entry of readdirSync(outDir, {
  recursive: true,
  withFileTypes: true,
})) {
  if (!entry.isFile() || !/\.(js|d\.ts)$/.test(entry.name)) {
    continue
  }
  const file = path.join(entry.parentPath, entry.name)
  const source = readFileSync(file, "utf8")
  const rewritten = source.replace(specifier, (match, lead, quote, target) =>
    isRelative(target)
      ? `${lead}${quote}${withJsExtension(target, path.dirname(file), [".js", ".d.ts"])}${quote}`
      : match
  )
  if (rewritten !== source) {
    writeFileSync(file, rewritten)
  }
}

const problems = findPublishProblems(packageDir)
if (problems.length) {
  console.error(
    `The published package.json doesn't match the build:\n  ${problems.join("\n  ")}`
  )
  process.exitCode = 1
}
