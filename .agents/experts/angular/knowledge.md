# Angular expert: knowledge

What the Angular expert knows. Part 1 is Angular itself, part 2 is how `@ui-sdk/angular` is built, part 3 is the checklist a review walks. Pinned to what the repo installs: Angular 22.3.0 (`packages/angular` peer range `@angular/core ^22.0.0`) on TypeScript 6.0.3.

Last checked: 2026-11-23, against `node_modules/@angular` 22.3.0.

Every line was checked against the installed packages or by a run in this repo, except the section marked as the plan's. Angular's idioms aren't restated here: read them in `.agents/skills/angular-developer/`, which Angular's team writes, or ask Angular's MCP server.

## 1. Angular 22, as checked

### Versions and peers

- `@angular/compiler-cli` 22.3.0 takes `typescript >=6.0 <6.1` and `@angular/compiler` 22.3.0 exactly as peers. It runs on Node `^22.22.3`, `^24.15.0` or `>=26`.
- `@angular/core` takes `rxjs ^6.5.3 || ^7.4.0` as a peer. `zone.js` and `@angular/compiler` are optional peers.
- `@angular/platform-browser` takes `@angular/core` and `@angular/common` at its own exact version.
- `@angular/compiler-cli` depends on `@babel/core` 8.1.0, beside the Babel 7 the rest of the repo resolves.

### The compiler

- **Partial mode keeps one file per source file.** `ngc` with `compilationMode: "partial"` emits a `.js` and a `.d.ts` for each. A directive's decorator becomes static `ɵɵngDeclareFactory` and `ɵɵngDeclareDirective` fields plus an `ɵɵngDeclareClassMetadata` call, and its declaration gets `ɵɵDirectiveDeclaration`.
- **A directive is standalone unless it says otherwise.** The declaration of one with no `standalone` flag reads `isStandalone: true`.
- **`experimentalDecorators` isn't needed.** `ngc` emits the same output with and without it, for a class decorator and for a legacy `@Input()`. Astra found the same for `input()` and `model()` fields: identical files either way, with `openChange` emitted for the model.
- **`strictTemplates` fails the build.** A template that reads a property its class doesn't have stops `ngc --noEmit` with TS2339.
- **Flags and options.** `ngc` takes tsc's flags on the command line, but `angularCompilerOptions` only from a tsconfig. To emit under the base tsconfig it needs `--noEmit false` and `--allowImportingTsExtensions false`.

### Errors

- Every runtime error starts with `NG0` and its code (`formatRuntimeError`), and in development a negative code adds a link to the error's docs page.
- The default `ErrorHandler` calls `console.error("ERROR", error)`.

### From the plan's scratch build

Checked outside this repo before the work began, and not yet repeated here:

- `ngc --noEmit` with `strictTemplates` accepts a directive that implements `FormCheckboxControl` and binds with `[formField]`.
- A generic part directive infers slot names and prop types from a primitive passed as an input, and a wrong slot name fails with TS2322.
- `renderApplication` puts attributes that a directive's constructor writes into the server HTML.
- A directive that provides itself with `useExisting` needs `forwardRef` under `ngc`.
- A structural directive beside a part directive, wrapped through `hostDirectives`, type-checks and server-renders, including `[(open)]`.

### The Analog plugin

`@analogjs/vite-plugin-angular` 2.9.7, read from its source. `contributing/angular/specs/p0.4.md` has the rest.

- It calls `require("@angular/build/private")` as it loads, so `@angular/build` must be installed, whatever its `package.json` says.
- Its `config` hook returns `oxc: config.oxc ?? false`. Unless the Vite config sets `oxc`, Vite stops transforming every other framework's TypeScript.
- Its transform takes every `.ts` outside `node_modules`, and `transformFilter(code, id)` narrows that.

## 2. How `@ui-sdk/angular` is built

A skeleton so far. The contract arrives with P1.8 in `contributing/angular/CONTRACT.md`, and this part grows with it.

- **One entry.** `@ui-sdk/angular/primitive`, at `packages/angular/src/primitive.ts`. It exports `UiRoot`, a stub directive with no behavior, until P1.3.
- **Build.** `scripts/build/build-angular-package.mjs` runs `ngc` in partial mode with the emit flags, adds `.js` to relative imports in the modules and their declarations, then checks the published manifest. The compiler's options are in `packages/angular/tsconfig.json`.
- **Type check.** `ngc --noEmit`, which `pnpm typecheck` runs.
- **Private.** The package is `"private": true` until Gate 3, so changesets and `check-packages.mjs` leave it out.
- **No stability labels.** `check-code.mjs` flags `@stable` or `@experimental` on an export outside `documentedPackages`, which Angular joins in 3F.1. An export carries its JSDoc and no label until then.
- **No unit tests yet.** `packages/angular/test/` and its vitest setup arrive with P1.1.
- **One declaration of the compiler.** `@angular/compiler-cli` is a dependency of `packages/angular` only. A second declaration in another workspace makes pnpm resolve Babel 7's subtree again, and `trustPolicy: no-downgrade` refuses that.
- **Browser specs.** The `angular` project in `tests/playwright.config.ts` runs every spec whose fixture exists at `apps/playground/src/fixtures/<fixture>/angular.ts`. On its pages a spec fails when a console or uncaught error matches `/^ERROR\b|\bNG0\d+/` (`angularErrors` in `tests/fixtures.ts`).
- **The playground doesn't compile Angular yet.** P0.4 is blocked, so no fixture exists.

## 3. Review checklist

1. Green for the right reason: skip counts against `solid`, `ng-version` on the page, no weakened assertion under `tests/specs/`, no behavior change under `packages/core/`, no new dependency.
2. Idiom: signals, with `computed` where an effect would only copy state, `inject()` over constructor parameters, standalone directives, and `@if` and `@for` where older code wrote `*ngIf` and `*ngFor`.
3. Every adapter's rules: behavior stays in core, generic files never import a component, the same part names, options and callbacks as the other adapters, an author's handler runs first and an author's `id` wins.
4. Server and hydration: nothing touches `window` in a constructor, attributes reach the server HTML, and nothing moves in the DOM before render.
5. Types: no return type annotations, exports listed once at the end, JSDoc on every export.
6. The task's spec in `contributing/angular/specs/`: every part, option and callback it lists exists, and nothing it doesn't list was added.
