# Angular expert: decisions

What's already decided about `@ui-sdk/angular`, and what's known and open. The expert never re-raises a **Settled** item as a finding. The decisions are numbered as in `contributing/angular/PLAN.md`.

Last reviewed: nothing yet, so `scripts/expert-scope.mjs` needs `--base`.

## Settled

D6 to D8 follow the plan's recommendation, and the owner confirms them when Phase 0 is signed off.

- **D6. TypeScript 6.0 in the catalog,** for every workspace. `@angular/compiler-cli` 22.3 accepts nothing else, and `vue-tsc`, `svelte-check` and `typescript-eslint` accept it. The five adapters pass `pnpm typecheck`, `pnpm build` and `pnpm check:packages --build` on it (P0.2).
- **D7. `ngc` in partial mode,** through `scripts/build/build-angular-package.mjs`, with one built file per source file like the other adapters. No ng-packagr (P0.3).
- **D8. `@angular/core` at `^22.0.0` as the peer,** developed on 22.3.0. Zoneless comes first. Passing with zone.js too is still to prove, in P1.2's unit tests.
- **Branches.** `angular` for integration and `angular-<id>-<slug>` per task. Git can't hold the plan's `angular/<id>-<slug>` beside `angular` (P0.1).
- **Private until Gate 3.** Nothing goes to npm before it, and `check-packages.mjs` leaves a private package out (P0.3).
- **No stability labels until 3F.1.** `check-code.mjs` rejects one on an export outside `documentedPackages`.
- **`@angular/compiler-cli` is declared in `packages/angular` only.** A second declaration trips `trustPolicy: no-downgrade`.
- **The error capture matches Angular's own marks only,** `ERROR` from its handler and `NG0` codes. Other console errors on a page are the spec's business, as on every other framework (P0.5).

## Pending Gate 1

The plan's recommendations, built in Phase 1 and frozen in `CONTRACT.md` at Gate 1. Until then a review may question one, with evidence from working code.

- **D1. Part shape.** Attribute directives on the author's own element, and no `render` input.
- **D2. Custom primitives.** Generic `[uiRoot]` and `[uiPart]` directives, with `providePrimitive`, `usePrimitive` and `usePart` for named directives. No runtime `createParts`.
- **D3. State and callbacks.** `model()` for state keys, and function inputs under core's names for callbacks and actions.
- **D4. Presence.** A structural directive beside the part directive for library parts, `@if (root.present(slot))` for custom primitives, and core's hidden element when neither is written.
- **D5. Forms.** Signal Forms' `FormValueControl` and `FormCheckboxControl`, a hidden input for native submission, and no `ControlValueAccessor`.

## The owner's alone

- **D9. Destination.** Fork-only to start, with an upstream issue once Gate 1 passes.
- **D10. Phase 3 scope.** Whether the docs pages and examples are in.

## Known and open (don't report again, check whether fixed)

- **P0.4 is blocked.** The Analog plugin needs `@angular/build`, and `trustPolicy: no-downgrade` refuses every install that adds it. The owner chooses among the options in `contributing/angular/specs/p0.4.md`. No Angular fixture exists until then.
- **Babel 8 beside Babel 7.** Since P0.3, pnpm resolves the optional `@babel/core` peer of Next, Nuxt, `styled-jsx` and `@solidjs/vite-plugin` to 8.1.0, which `@angular/compiler-cli` brings. The root still holds 7.29.7, and nothing in the repo asks the Solid plugin for Babel.
- **Four gates are red on Windows before any Angular work:** `pnpm lint` (`check-code.mjs`), `pnpm size`, a handful of unit tests in core, `@ui-sdk/web` and the docs app, and the examples build. `contributing/angular/specs/p0.1.md` has the baseline.
- **A base fixture reaches every framework in the planner.** `frameworksOf` in `scripts/affected-specs.mjs` maps only `<framework>-*` helper files to one framework, so `tabs/angular.ts` plans the Tabs specs everywhere, as `tabs/react.tsx` does.

## Revisit

Nothing yet.
