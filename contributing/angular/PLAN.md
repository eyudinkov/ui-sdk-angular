# Angular adapter for UI SDK: implementation plan

2026-11-23

Exported from the plan document on 2026-11-23, revision 67. The document is the source, and the coordinator exports it again when it changes. Where a spec in [specs/](specs/) settles something differently, like the branch names in [specs/p0.1.md](specs/p0.1.md), the spec holds.

## Summary

Angular support is a sixth adapter package, `@ui-sdk/angular`, built on Angular 22.3 and delivered through three gates. The plan assumes no change to core behavior; anything that needs one stops for review.

| Milestone                      | Done means                                                                                                                                                                                     | Estimate              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1. First working slice         | Angular compiles in the shared playground. Generic root and part directives exist. Tabs, Rating and Popover pass their behavior and accessibility specs on a new `angular` Playwright project. | 2 to 4 days           |
| 2. All components, client-side | All 51 components pass their behavior, accessibility, right-to-left and screen-reader specs.                                                                                                   | 1 to 2 weeks more     |
| 3. Parity                      | Server rendering with hydration, forms, the data API, examples, docs, packaging, size budgets and CI match the other five adapters.                                                            | 4 to 6 weeks in total |

The durations are estimates from reading the code. They assume three or four Opus sessions working in parallel after Gate 1.

**What was checked.** The repo scan covers commit `a349d52` of [vercel-labs/ui](https://github.com/vercel-labs/ui) (23 Nov 2026, `0.1.0-beta.15`). A scratch build outside the repo confirmed the toolchain: Angular 22.3.0, Vite 8.3.8, the Analog plugin 2.9.7 and TypeScript 6.0.3 compile, type-check and server-render a directive-based control. Nothing in the repo itself was installed or run, so Phase 0 repeats that proof inside the shared playground.

## Decisions to confirm

Ten choices shape the adapter, and each has a recommended default so work can start without waiting. D1 to D5 are confirmed at Gate 1 on working code, D6 to D8 during Phase 0, and D9 and D10 are yours alone.

| #   | Decision            | Recommended                                                                                                                                                                                                                                    | Alternative                                                                                                                       |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Part shape          | Attribute directives on the author's own element: `<button uiTabsTab value="a">`. No `render` input, since the author already picks the element.                                                                                               | Element components, which cannot change their host tag.                                                                           |
| D2  | Custom primitives   | No runtime `createParts`, because Angular's compiler cannot see classes made at runtime. Ship generic `[uiRoot]` and `[uiPart]` directives typed from the primitive, plus `usePrimitive` and `usePart` for named directives.                   | A generator that writes directive classes from a primitive's schema.                                                              |
| D3  | State and callbacks | `model()` for state keys, so `[(value)]` works. Callbacks and actions are function inputs under core's names, like `[onValueChange]`, keeping `(value, details)` and `details.cancel()`.                                                       | A second output per callback that carries one event object.                                                                       |
| D4  | Presence            | A part that comes and goes exists only while it is present. Library parts take a structural directive beside the part directive, as Spartan does: `<div uiDrawerContent *uiDrawerPortal>`. Custom primitives use `@if (root.present('slot'))`. | Keep every part in the DOM and let core hide it, as the web adapter does. That remains what happens when neither form is written. |
| D5  | Forms               | Controls implement Signal Forms' `FormValueControl` or `FormCheckboxControl`. Native submission uses a hidden input rendered by an attribute-selector component. No `ControlValueAccessor`.                                                    | A separate `ControlValueAccessor` bridge entry.                                                                                   |
| D6  | TypeScript          | Move the catalog from 5.9 to 6.0, which Angular 22.3 requires.                                                                                                                                                                                 | TypeScript 6 only for the Angular package, the playground and the examples.                                                       |
| D7  | Package build       | `ngc` in partial mode through a new `scripts/build/build-angular-package.mjs`, keeping the per-file `dist` layout the other adapters use.                                                                                                      | ng-packagr.                                                                                                                       |
| D8  | Angular range       | Peer `@angular/core` at `^22.0.0`, developed on 22.3. Zoneless first, and also passing with zone.js.                                                                                                                                           | 22.3 only.                                                                                                                        |
| D9  | Destination         | Start fork-only, and open an upstream issue once Gate 1 passes. Upstream needs a maintainer's sign-off before any API lands.                                                                                                                   | Stay fork-only and publish under your own npm scope, since a fork cannot publish under `@ui-sdk`.                                 |
| D10 | Phase 3 scope       | Include the 71 docs pages and about 590 example files.                                                                                                                                                                                         | Ship the package and its tests only.                                                                                              |

D5 rests on Angular's own guide, which says custom Signal Forms controls work with reactive and template-driven forms without compatibility code ([angular.dev](https://angular.dev/guide/forms/signals/custom-controls)). That guide shows components only, so Phase 1 proves it for directives at runtime; the scratch build proved it at compile time.

## Target stack

The latest Angular is 22.3.0, published on 18 Nov 2026, and it forces one repo-wide change: TypeScript 6. Versions are from the npm registry on 23 Nov 2026.

| Piece                                                       | Version                               | Fit with the repo                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Angular: `core`, `compiler-cli`, `forms`, `platform-server` | 22.3.0                                | Latest on npm. No version 23 pre-release is published yet.                                                                         |
| TypeScript                                                  | 6.0.3                                 | `@angular/compiler-cli` needs `>=6.0 <6.1`. The catalog has `~5.9.3`, plus 7.0.2 for plain type checks through `scripts/tsgo.mjs`. |
| Node                                                        | 24.15 or newer                        | Angular needs `^22.22.3`, `^24.15.0` or `>=26`. `.nvmrc` says `24`.                                                                |
| Vite plugin                                                 | `@analogjs/vite-plugin-angular` 2.9.7 | Accepts Vite 6 to 8 and `@angular/build` 22. The repo is on Vite `^8.3.3`.                                                         |
| vue-tsc, svelte-check, typescript-eslint                    | Current releases                      | Their peer ranges accept TypeScript 6.0. The pitfalls note about vue-tsc concerns TypeScript 7.                                    |
| Lint                                                        | `angular-eslint` 22.8.0               | Accepts ESLint 10 and typescript-eslint 8, which the repo has.                                                                     |
| zone.js                                                     | None                                  | An optional peer of `@angular/core`.                                                                                               |

The workspace sets `minimumReleaseAge: 1440`, so a package must be a day old to install. Every version above qualifies.

**What the scratch build proved**

- `ngc --noEmit` with `strictTemplates` accepts a directive that implements `FormCheckboxControl` and binds with `[formField]`.
- A generic part directive infers slot names and prop types from a primitive passed as an input. A wrong slot name fails with TS2322.
- `vite build` with the Analog plugin compiles signal inputs, `model()` and `afterNextRender`.
- `renderApplication` puts attributes that a directive's constructor writes into the server HTML.
- `ngc` in partial mode emits one `.js` and one `.d.ts` per source file, which fits the repo's `publishConfig.exports` layout.
- A directive that provides itself with `useExisting` needs `forwardRef` under `ngc`.
- A structural directive beside a part directive, wrapped through `hostDirectives` in components with their own element names, type-checks and server-renders with stand-in directives, including `[(open)]`.
- A custom primitive on the real core, behind stub directives, renders its `data-slot` attributes on the server and leaves a part out of the HTML while `present` is false.

The plugin's `transformFilter`, `tsconfig`, `jit` and `fastCompile` options are the levers for scoping it to Angular files in the shared Vite config.

## What the repo requires

A sixth framework touches 19 areas of the repo, and most of them hold a hard-coded list of the five frameworks. Line numbers are from commit `a349d52`.

| #   | Area                | Where                                                                                                                                               | What Angular needs                                                                                                                                                                                                                                                  |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | New package         | `packages/angular/`                                                                                                                                 | A `package.json` with `exports` to `src` and `publishConfig.exports` to `dist`, peers on `@ui-sdk/core` and `@angular/core`, plus `tsconfig.json`, `test/` and `README.md`. Vue ships 70 entries: 56 components, 12 utilities, the root and Nuxt. Angular needs 69. |
| 2   | Workspace           | `pnpm-workspace.yaml`, root `package.json`, `.nvmrc`                                                                                                | Catalog entries for Angular and TypeScript 6, `angular-eslint` as a dev dependency, and Node 24.15 or newer.                                                                                                                                                        |
| 3   | Build               | `scripts/build/`                                                                                                                                    | A `build-angular-package.mjs` beside `build-svelte-package.mjs`: `ngc` partial compile, then the shared `publish-manifest.mjs` check. `pnpm build` finds the package through its filter.                                                                            |
| 4   | Package check       | `scripts/check-packages.mjs`, `scripts/package-consumers/`                                                                                          | Link the Angular packages into the scratch app, in the list near line 65, and add a consumer folder.                                                                                                                                                                |
| 5   | Code lint           | `scripts/check-code.mjs` line 218, `scripts/public-exports.mjs` line 14                                                                             | Add `angular` to `renderers` and `documentedPackages`. The rules then apply: no return types, exports at the end, JSDoc and a stability label on every public export, and core imports only through `@ui-sdk/core/renderer`.                                        |
| 6   | Idiom lint          | `eslint.config.mjs`                                                                                                                                 | An `angular-eslint` block for `packages/angular/src`, the Angular fixtures and the Angular examples.                                                                                                                                                                |
| 7   | Coverage lint       | `scripts/check-coverage.mjs` lines 16 and 17                                                                                                        | Add `angular` to `docsFrameworks` and `fixtureFrameworks` only at parity, since both demand every component at once.                                                                                                                                                |
| 8   | Playwright projects | `tests/playwright.config.ts`                                                                                                                        | Add `angular`, `angular-data` and `angular-ssr` to `frameworks`, and `angular` to the sheet list. A spec whose fixture is missing drops out through `specsThatSkip`, so coverage grows one component at a time.                                                     |
| 9   | Test planner and CI | `scripts/affected-specs.mjs` line 64, `.github/workflows/ci.yml` line 286                                                                           | Add `angular` to both lists.                                                                                                                                                                                                                                        |
| 10  | Test fixture        | `tests/fixtures.ts`, `tests/fixture-files.ts`                                                                                                       | Record Angular's console errors the way Solid's and Svelte's diagnostics are recorded. Kitchen sinks run only for React, Vue and web.                                                                                                                               |
| 11  | Spec branches       | `tests/specs/`                                                                                                                                      | 168 files read `framework`, and about 100 lines branch on `web`. Each branch needs a decision for Angular.                                                                                                                                                          |
| 12  | Playground build    | `apps/playground/vite.config.ts`, `package.json`, `ssr-plugin.ts`, `src/ssr/`                                                                       | The Analog plugin first in the list and scoped with `transformFilter`, a `tsconfig.angular.json`, an `ngc --noEmit` step in `typecheck`, and a server renderer for `/__ssr`. `src/main.ts` needs no change.                                                         |
| 13  | Fixtures            | `apps/playground/src/fixtures/<name>/`                                                                                                              | `angular.ts`, plus `angular-data.ts` and `angular-ssr.ts` where the others have them. A helper must be named `angular-*.ts` so the planner maps it to Angular. There are 151 fixture folders; React has 202 files.                                                  |
| 14  | Unit tests          | `packages/angular/test/`                                                                                                                            | vitest with jsdom, like the others. Vue has 74 test files to port from, React 98.                                                                                                                                                                                   |
| 15  | Examples            | `examples/vite.config.ts`, `scripts/build.mjs`, `mount/`, `prerender/`, `shared/`                                                                   | A `builds.angular` entry, `mount/angular.ts`, `prerender/angular.ts` and a typecheck step, then 59 component folders. Vue has 591 example files.                                                                                                                    |
| 16  | Docs site           | `apps/docs/lib/frameworks.ts`, `llms.ts`, `package-docs.ts`, `setup-prompts.ts`, `next.config.mjs`, `content/docs/meta.json`, `scripts/docs-dev.sh` | Register the framework, then write `content/docs/angular/`: 71 pages. Vue's run to 21,381 lines.                                                                                                                                                                    |
| 17  | Size and perf       | `scripts/size.mjs`, `size-budget.json`, `tests/perf/budgets.ts`                                                                                     | Per-entry budgets. Measuring needs an Angular compile step inside the script.                                                                                                                                                                                       |
| 18  | Experts and skills  | `.agents/experts/angular/`, `.claude/agents/angular-expert.md`, `scripts/expert-scope.mjs` line 17, `packages/core/skills/ui-sdk/SKILL.md`          | An Angular expert with `expert.md`, `knowledge.md` and `decisions.md`, and the framework added to the skill that ships to users.                                                                                                                                    |
| 19  | Prose and release   | `README.md`, `AGENTS.md`, `contributing/*.md`, `tests/README.md`, `.changeset/`                                                                     | Every "five frameworks" line, the rendering contract in `architecture.md`, the mapping table in section 10 of `api-guide.md`, and a changeset. The `fixed` group already covers `@ui-sdk/*`.                                                                        |

**Rules every adapter follows**, from `AGENTS.md` and `contributing/`:

- Zero runtime dependencies. The package depends only on `@ui-sdk/core` and Angular, both as peers.
- Behavior lives in core. Generic adapter files never import a specific component.
- One shape everywhere: the same part names, options and callbacks as the other adapters, and no `as` prop.
- A user's handler runs before core's and can call `preventDefault()` to skip it. An author's `id` wins.
- It works on the server and before hydration, right to left without a provider, and popups without portals.
- Style: no semicolons, double quotes, no return type annotations, named exports listed at the end, comments rare and three lines at most.
- Commits are conventional with a lowercase subject. Tests run through `scripts/test-slot.sh`, each server on its own port.

## Adapter design

The adapter is a thin layer of directives that hand each element to core, which writes the attributes and attaches the events itself. It is the web adapter's approach, with Angular's dependency injection and signals in place of custom elements.

### Usage

Target usage for a library component, to be confirmed at Gate 1:

```html
<div uiTabs [(value)]="tab">
  <div uiTabsList aria-label="Settings">
    <button uiTabsTab value="account">Account</button>
    <button uiTabsTab value="password">Password</button>
    <span uiTabsIndicator></span>
  </div>
  <div uiTabsPanel value="account">…</div>
  <div uiTabsPanel value="password">…</div>
</div>
```

A part that comes and goes takes a structural directive beside its part directive, so its content exists only while it is present. A side sheet over core's Drawer:

```html
<ng-container uiDrawer side="end" [(open)]="open">
  <button uiDrawerTrigger type="button">Documents</button>

  <div uiDrawerContent *uiDrawerPortal class="sheet">
    <h2 uiDrawerTitle>Documents</h2>
    <p uiDrawerDescription>Everything filed for this meeting.</p>
    <button uiDrawerClose type="button" aria-label="Close">×</button>
  </div>
</ng-container>
```

A primitive written outside the library, here the README's search field. The root's `present` drives `@if`, so the Clear button exists only while there is a value:

```html
<div [uiRoot]="searchField" #field="uiRoot">
  <input [uiPart]="'input'" [of]="searchField" placeholder="Search" />
  @if (field.present("clear")) {
  <button [uiPart]="'clear'" [of]="searchField">Clear</button>
  }
</div>

<p>Searching for: {{ field.state().value }}</p>
```

The same primitive as named directives, the Angular counterpart of `createParts`:

```ts
@Directive({
  selector: "[searchField]",
  exportAs: "searchField",
  providers: [providePrimitive(searchField)],
})
class SearchField {
  readonly #handle = usePrimitive(searchField)
  readonly state = this.#handle.state
  readonly api = this.#handle.api
}

@Directive({ selector: "input[searchFieldInput]" })
class SearchFieldInput {
  readonly part = usePart(searchField, "input")
}

@Directive({ selector: "button[searchFieldClear]" })
class SearchFieldClear {
  readonly part = usePart(searchField, "clear")
}
```

### Styled layers on top

An app can keep its own component names over the adapter, as Spartan's helm layer does over brain, by composing part directives through `hostDirectives`. The wrappers hold the styles and nothing else.

```ts
@Component({
  selector: "hlm-sheet",
  hostDirectives: [
    { directive: Drawer, inputs: ["open", "side"], outputs: ["openChange"] },
  ],
  host: { class: "contents" },
  template: `<ng-content />`,
})
class HlmSheet {}

@Directive({ selector: "[hlmSheetPortal]", hostDirectives: [DrawerPortal] })
class HlmSheetPortal {}

@Component({
  selector: "hlm-sheet-content",
  hostDirectives: [DrawerContent],
  host: { class: "fixed inset-y-0 end-0 flex flex-col bg-background" },
  template: `<ng-content />`,
})
class HlmSheetContent {}

@Directive({ selector: "[hlmSheetClose]", hostDirectives: [DrawerClose] })
class HlmSheetClose {}
```

The app's template then reads as it would with Spartan:

```html
<hlm-sheet side="end" [(open)]="open">
  <hlm-sheet-content *hlmSheetPortal class="min-h-0 overflow-hidden">
    <button hlmBtn hlmSheetClose type="button">Close</button>
  </hlm-sheet-content>
</hlm-sheet>
```

Whatever takes focus or a press stays a native element, so a wrapper such as `hlm-select-trigger` renders a real `<button>` inside itself.

### Contract mapping

Each rule in `architecture.md` has one Angular counterpart.

| Contract in `architecture.md`            | Angular mapping                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One instance per root, kept for its life | The root directive calls `usePrimitive(primitive, () => options)` in its constructor. It keeps the instance once the view renders in a browser, never on a server, and calls `instance.destroy()` from `DestroyRef`.                                                            |
| Parts find their instance                | One `InjectionToken` per primitive, provided by the root. Parts `inject()` it. A `controller` input serves triggers outside the root.                                                                                                                                           |
| Options and slot props                   | Signal `input()`s named as in the schema. Boolean and number kinds take `booleanAttribute` and `numberAttribute`, so bare attributes work. An effect passes them to `instance.setOptions`.                                                                                      |
| Controlled state                         | `model()`, which gives `[value]`, `[(value)]` and `(valueChange)`. The model is written only after an uncanceled change.                                                                                                                                                        |
| Callbacks and actions                    | Function inputs with core's names and signatures.                                                                                                                                                                                                                               |
| Attributes                               | Core writes them to the host with `applyAttrs`: once in the constructor, so they reach server HTML, then on each `subscribe` notification. There are no host bindings, so no change detection runs.                                                                             |
| Events                                   | `bind(part, el)` inside `afterNextRender`, so core's listeners attach after the template's own.                                                                                                                                                                                 |
| Part state in templates                  | `exportAs` plus a `state` signal: `#tab="uiTabsTab"`, then `tab.state().selected`.                                                                                                                                                                                              |
| Presence                                 | Core's `present` stays true through an exit animation. A structural directive per conditional part, such as `*uiDrawerPortal`, creates the element while it is true. The root's `present(slot)` gives `@if` the same signal. With neither, the element stays and core hides it. |
| Parts that render something              | A component with the same attribute selector: hidden form inputs, data lists and the overlay host.                                                                                                                                                                              |
| Popups                                   | The top layer by default. A `container` input resolves through `portalTarget`, and the element moves only after render.                                                                                                                                                         |
| Ids                                      | A counter under `APP_ID`. Core's `takeOwnId` and `markAuthored` keep an author's id and attributes.                                                                                                                                                                             |
| Custom primitives                        | `UiRoot` and `UiPart` from `@ui-sdk/angular/primitive` for templates, and `providePrimitive`, `usePrimitive` and `usePart` for named directives.                                                                                                                                |
| Styled layers                            | Every part directive works inside `hostDirectives`, with each model exposed as an input and an output, so an app can wrap parts in its own components.                                                                                                                          |

The shared files mirror Vue's: `use-primitive.ts`, `use-part.ts`, `primitive.ts`, `popup.ts`, `form-inputs.ts`, `field-context.ts`, `controller-target.ts` and `list-items.ts`, then one file per entry. For scale, the generic layer is 854 lines in Svelte, 1,381 in Vue and 2,385 in web.

**Sharp edges to prove in Phase 1.** Each becomes a unit test in `packages/angular/test/`.

1. An author's `(click)` runs before core's handler and can cancel it.
2. Author bindings on `[attr.aria-label]`, `[id]`, `class` and `style` survive core's writes, whichever comes first.
3. Parts find their root through `@if`, `@for`, `ng-content` and `ng-template`.
4. Parts made by `@for` report DOM order through `elements(slot)`.
5. A popup moved to a container is removed when its view is destroyed.
6. The same code updates in zoneless and zone.js apps.
7. Generic value types reach the template, for `TabsGeneric` and its siblings.
8. `[formField]` drives a directive control at runtime.
9. Content inside a `*uiPopoverPortal` template finds its root, and an exit animation finishes before the view is destroyed.
10. A wrapper that composes a part through `hostDirectives` behaves like the part, including `[(open)]`.

## Work plan

The work runs in four phases, and only the first two are serial: the contract must be right before 51 components copy it. Task ids match the issues to open on the fork.

_A diagram in the plan document: work plan · 4 phases, 3 gates._

Gate 1 matters most: nothing fans out until the contract has passed real specs and your review.

Every task, with its fixtures and spec files, is in [TASKS.md](TASKS.md).

### Phase 0: foundation

One Opus session. Exit: `?fixture=tabs&framework=angular` renders an empty Angular component, and every existing gate still passes.

| Task | Work                                                                                                                           | Proof                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| P0.1 | Fork, create the `angular` integration branch, and agree the rebase rhythm against upstream `main`.                            | Branch exists. `pnpm install`, `pnpm typecheck` and `pnpm build` pass untouched.                      |
| P0.2 | Apply D6: TypeScript 6 in the catalog.                                                                                         | `pnpm typecheck`, `pnpm build` and `pnpm check:packages --build` pass for the five existing adapters. |
| P0.3 | Scaffold `packages/angular` with the `primitive` entry only, and write `build-angular-package.mjs`.                            | `pnpm --filter @ui-sdk/angular build` emits `dist` and the manifest check passes.                     |
| P0.4 | Add the Analog plugin to the playground, scoped to Angular files, with `tsconfig.angular.json`.                                | The Tabs spec still passes on `react`, `vue`, `svelte`, `solid` and `web`.                            |
| P0.5 | Wire the tests: the `angular` project, `affected-specs.mjs`, console-error capture in `tests/fixtures.ts`.                     | `npx playwright test --project angular --list` shows only specs that have a fixture.                  |
| P0.6 | Set up the agents: the Angular expert files, `expert-scope.mjs`, Angular's MCP server and skills, and `contributing/angular/`. | Astra answers a question in expert mode from its own worktree.                                        |

### Phase 1: contract and first slice

One Opus session, with Astra reviewing every pull request. Exit is Gate 1.

| Task | Work                                                                                                                                             | Proof                                                                                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1 | `use-primitive.ts`: instance, handle, tokens, options, models and lifecycle.                                                                     | Unit tests for options, controlled state and destroy.                                                                                                                                                       |
| P1.2 | `use-part.ts`: attributes, binding after render, subscription, the state signal, and presence through `present(slot)` and structural directives. | The ten sharp-edge tests from the design section.                                                                                                                                                           |
| P1.3 | `UiRoot`, `UiPart` and the `primitive` entry.                                                                                                    | The README's search field works as a fixture.                                                                                                                                                               |
| P1.4 | Tabs, for plain composition.                                                                                                                     | `tabs.spec.ts`, `tabs.a11y.spec.ts` and `tabs.rtl.spec.ts` pass on `angular`.                                                                                                                               |
| P1.5 | Rating, for a form control with hidden inputs, form reset and Signal Forms.                                                                      | `rating``.spec.ts` passes, including its form tests.                                                                                                                                                        |
| P1.6 | Popover, for the popup layer, `*uiPopoverPortal` and `container`.                                                                                | `popover.``spec.ts`, `p``opover.a11y.spec.ts` and `popover.rtl.spec.ts` pass, apart from the nested-menu tests, which wait for Menu. Closed content is absent from the DOM. A unit test covers `container`. |
| P1.7 | Audit the `framework` branches in the specs those three components run.                                                                          | A list of every branch and Angular's side of it, in the pull request.                                                                                                                                       |
| P1.8 | Write `CONTRACT.md` and fill `decisions.md` with D1 to D5 as built.                                                                              | Astra's review is clean, and you sign off.                                                                                                                                                                  |

### Phase 2: fan-out

Three or four Opus sessions, one worktree per component, in the five waves below. Each component is one pull request: its entry file, its fixtures, its spec run and any unit test the Vue adapter has for it. Exit is Gate 2.

A contract change found here stops the wave. It lands first as its own pull request against `CONTRACT.md`, reviewed by Astra, before any component uses it.

### Phase 3: parity

Six tracks that run in parallel. Tracks A and C can start right after Gate 1 on the three-component slice, which surfaces hydration problems early. Exit is Gate 3.

| Track                | Work                                                                                               | Proof                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| A. Server rendering  | The `/__ssr` renderer, an Angular hydrate helper and `angular-ssr.ts` fixtures.                    | `*.ssr.spec.ts` pass on `angular-ssr` with no hydration error recorded.                  |
| B. Data and sheets   | `angular-data.ts` fixtures, and popups presented as sheets.                                        | The `angular-data` and `angular-sheet` projects pass.                                    |
| C. Forms             | Signal Forms, reactive and template-driven interop, and native submission before hydration.        | Unit tests for all three form systems, plus `form.spec.ts` and `forms.``form.``spec.ts`. |
| D. Packaging         | The package consumer, size budgets, the CI project list and a changeset.                           | `pnpm check:packages --build` and `pnpm size` pass.                                      |
| E. Examples and docs | `examples/**/angular/`, the docs site wiring, 71 pages and the shipped skill. Only if D10 says so. | `pnpm --filter examples build` and `pnpm test:docs` pass.                                |
| F. Lists flipped     | `angular` joins `check-coverage.mjs`, `public-exports.mjs` and the prose.                          | `pnpm lint` passes with Angular held to every rule.                                      |

## Component waves

The 51 components split into the three-component slice and five waves, grouped by the core engine they share so each wave reuses what the one before proved.

| Wave                             | Components                                                                                                                             | Count | What it adds                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------- |
| Slice, in Phase 1                | Tabs, Rating, Popover                                                                                                                  | 3     | Composition, a form control and the popup layer.                                         |
| 1. Composition                   | Accordion, Collapsible, Avatar, Meter, Pagination, Timeline, Button, Separator, Toggle                                                 | 9     | Disclosure, roving focus and gauges.                                                     |
| 2. Form controls                 | Field, Input, Checkbox, Radio, Switch, Segmented Control, OTP Input, Number Input, Password Input, File Input, Slider, Label, Progress | 13    | Hidden inputs, Field wiring and Signal Forms. Also the Textarea entry.                   |
| 3. Popups                        | Menu, Dialog, Drawer, Tooltip, Hover Card, Navigation Menu, Menubar, Toolbar, Toast                                                    | 9     | Modal layers, submenus and the overlay host. Also the Alert Dialog and Overlays entries. |
| 4. Lists                         | Listbox, Select, Combobox, Autocomplete, Command, Trigger Menu, Token Input, Tree                                                      | 8     | The shared listbox engine and the data API.                                              |
| 5. Dates and direct manipulation | Calendar, Date Input, Date Picker, Color Picker, Image Cropper, Carousel, Resizable, Scroll Area, Waterfall                            | 9     | Dates, dragging and gestures. Also the Time Input and Preferences entries.               |

Rating stands in for Switch in the slice because `switch.spec.ts` opens the shared `forms` fixture, which also renders Checkbox, Radio and Field. Those four land together in wave 2, and 12 spec files open that fixture.

The order follows what each fixture imports. Label's fixture renders Checkbox, Radio, Number Input and Slider, Progress's renders OTP Input, and Toolbar's renders Menu, so each sits in the later wave.

Waves 1 and 2 can run side by side once Gate 1 passes. Waves 3 and 4 follow, since Menu and Select build on the popup work from the slice.

The 12 utility entries, such as `agent`, `observe`, `history` and `shortcuts`, are mostly re-exports from core and go in as one task during wave 1. The heaviest components in the Vue adapter are Menu at 829 lines, Combobox at 809 and Select at 708, so they get a worktree each.

## Orca workflow

Opus writes and Astra reviews, each in its own worktree, and everything the two must share lives in files in the repo. Claude Code and Codex keep separate conversations, so nothing that matters may live only in a chat.

This assumes Orca is the [stablyai/orca](https://github.com/stablyai/orca) app. Its README lists a worktree per agent, review notes on changed lines that go back to an agent, pull request comments that go back to an agent, and a coordinator agent that starts workers. The workflow below needs only worktrees and pull requests, so it survives a different tool.

_A diagram in the plan document: review loop · 5 steps, 1 decision._

A finding sends the task back to the same Opus worktree. Only a clean review reaches the coordinator, who re-runs the gates before merging.

### Roles

| Role        | Who                                                           | Does                                                                                                       | Never                                    |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Coordinator | One Claude Code session                                       | Opens task issues from this plan, starts workers, re-runs gates, merges into `angular`, keeps `STATUS.md`. | Writes adapter code.                     |
| Implementer | Opus 5.5 at high effort in Claude Code, one worktree per task | Builds one task, runs its gates, opens a pull request with the handoff note.                               | Merges, or edits a spec to make it pass. |
| Reviewer    | GPT-6.2 Astra at xhigh effort in Codex, in its own worktree   | Reviews every pull request as the Angular expert and proves each finding.                                  | Commits to a task branch.                |
| You         | Eduard                                                        | Decide D1 to D10 and sign off the three gates.                                                             |                                          |

Both model settings are required: Opus 5.5 at high effort for every implementer session, and GPT-6.2 Astra at xhigh effort for every review.

### Shared context

| File                                   | Holds                                                                            | Kept by                                     |
| -------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| `AGENTS.md`                            | The project rules. Both tools read it: `CLAUDE.md` is one line that includes it. | Upstream                                    |
| `contributing/angular/PLAN.md`         | This plan, exported as Markdown.                                                 | Coordinator                                 |
| `contributing/angular/CONTRACT.md`     | The adapter contract, frozen at Gate 1.                                          | Implementer, through reviewed pull requests |
| `contributing/angular/STATUS.md`       | One row per component: owner, branch, spec counts, review state.                 | Coordinator                                 |
| `.agents/experts/angular/expert.md`    | The reviewer's brief, adapted from Vue's.                                        | Coordinator                                 |
| `.agents/experts/angular/knowledge.md` | Angular 22 facts that were checked, and how the adapter is built.                | Both agents                                 |
| `.agents/experts/angular/decisions.md` | Settled decisions the reviewer must not raise again.                             | Coordinator                                 |

### Handoff note

Every pull request description carries the same six fields, so Astra starts from facts.

1. Task id and scope.
2. Contract sections relied on or changed.
3. Commands run, each with its exit code.
4. Spec counts on `angular` and on `solid` for the same files: passed, failed, skipped.
5. Known gaps.
6. Questions for the reviewer.

### Review brief for Astra

- Run the gates yourself instead of trusting the note.
- Prove every finding with a failing throwaway test or a repro, and delete the test afterwards.
- Check the result is green for the right reason: skip counts match Solid's, the page carries `ng-version`, no assertion under `tests/specs/` was weakened, nothing under `packages/core/` changed behavior, and no dependency was added.
- Check the idiom: signals, `inject()`, standalone directives and the built-in control flow.
- Hand back a verdict, ranked findings, then "Suspected" and "Revisit", as `expert.md` defines.

### Mechanics

- Both agents connect Angular's MCP server with `npx @angular/cli mcp` for its `search_documentation` and `get_best_practices` tools ([angular.dev](https://angular.dev/ai/mcp)), and install the `angular-developer` skill from `angular/skills` ([angular.dev](https://angular.dev/ai/agent-skills)). Model memory may predate Angular 22.
- Branches: `angular` for integration and `angular/<task-id>-<slug>` per task. Rebase `angular` on upstream `main` at every gate at least.
- Every worktree sets its own `PLAYGROUND_PORT` and runs tests through `scripts/test-slot.sh`. The script allows two test runs at once per machine, and `UI_SDK_TEST_SLOTS` raises that.

## Gates and verification

Every task passes the repo's own checks plus four Angular ones, and each of the three gates adds your sign-off. Check exit codes, not output, as `tests/README.md` asks.

Per task, from the task's worktree:

```bash
pnpm lint && pnpm format && pnpm typecheck
pnpm --filter @ui-sdk/angular test
cd tests && PLAYGROUND_PORT=5310 ../scripts/test-slot.sh \
  npx playwright test specs/<name> --project angular
pnpm test:pr --base origin/angular
```

The four Angular checks:

- **Templates type-check.** `ngc --noEmit` with `strictTemplates` runs over the package, the fixtures and the examples.
- **Skip parity.** The same spec files report the same skip count on `--project ``solid` and `--project angular`, or the handoff note explains each difference. A missing fixture skips silently, so a green run can hide untested code. Solid is the reference because, like Angular, it has no kitchen sinks.
- **No recorded errors.** No hydration mismatch and no Angular runtime error reaches the console during a spec.
- **Zone parity.** Unit tests run zoneless and with zone.js.

| Gate | Passes when                                                                                                                                                                                                     | Then                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1    | Every Phase 1 proof holds. `CONTRACT.md` exists, D1 to D5 are written into `decisions.md`, and Astra's review is clean.                                                                                         | You sign off the API. Fan-out starts.                     |
| 2    | All 51 components pass their behavior, accessibility, right-to-left, screen-reader, render and enhancement specs on `angular`. `STATUS.md` shows no open review.                                                | You confirm D9 and D10. Parity work starts in full.       |
| 3    | `pnpm lint`, `pnpm format`, `pnpm typecheck`, the unit tests, `pnpm --filter examples build`, `pnpm check:packages --build`, `pnpm size` and `pnpm test:sweep` pass, with `leaks.spec.ts` running on `angular`. | Release from the fork, or open the upstream pull request. |

## Risks

Upstream churn is the largest risk, and the first two phases exist to retire the next three. Each row names what contains it.

| #   | Risk                                                  | Why it matters                                                                      | Containment                                                                                            |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Upstream churn                                        | 719 commits in four weeks, and `@ui-sdk/core/renderer` may change with any release. | Rebase at each gate. Keep each edit to a shared file small and in its own commit.                      |
| 2   | The Analog plugin beside four other framework plugins | It is proven only in isolation.                                                     | P0.4. Fallbacks: `jit: true`, then a separate Vite build for the Angular fixtures.                     |
| 3   | TypeScript 6 side effects                             | It changes type checking for all six packages.                                      | P0.2 runs before anything else. The fallback is the alternative in D6.                                 |
| 4   | Outdated Angular from the models                      | Their training may predate signals-first Angular 22.                                | Angular's MCP server and skill, `angular-eslint`, and Astra's idiom check.                             |
| 5   | Green for the wrong reason                            | A missing fixture skips silently, and an agent can weaken a spec.                   | Skip parity, and a line-by-line review of any diff under `tests/specs/`.                               |
| 6   | A contract mistake copied 51 times                    | Fan-out multiplies it.                                                              | The Gate 1 freeze. A contract change lands alone first.                                                |
| 7   | Hydration against imperative DOM work                 | Hidden inputs and moved popups can break hydration.                                 | Rendered parts are components, elements move only after render, and Track A starts right after Gate 1. |
| 8   | Angular idiom against "one shape everywhere"          | D2 and D3 differ from the other adapters by necessity.                              | Settle D9 early, and take the Gate 1 slice upstream as evidence.                                       |
| 9   | Test throughput                                       | About 3,000 tests per framework, and two test slots per machine.                    | `pnpm test:pr` runs only affected specs. Raise `UI_SDK_TEST_SLOTS` on a larger or remote machine.      |
| 10  | Three ways to write a conditional part under D4       | The structural directive, `@if` and the hidden fallback must behave alike.          | Fixtures use the structural directive, so the specs cover it. Unit tests cover the other two.          |

## Appendix: counts from the scan

| Measure                      | Value                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commit scanned               | `a349d52`, 23 Nov 2026, `0.1.0-beta.15`                                                                                                             |
| Repo history                 | First commit 26 Oct 2026, 719 commits                                                                                                               |
| Core components              | 51                                                                                                                                                  |
| Entries per adapter          | React 68, Solid 69, Svelte 69, Vue 70, web 61                                                                                                       |
| Generic layer, lines         | Svelte 854, Solid 1,360, Vue 1,381, React 1,459, web 2,385                                                                                          |
| Adapter source, lines        | React 14,217, web 14,345, Solid 14,467, Vue 17,390, Svelte 24,811                                                                                   |
| Playwright spec files        | 370, with about 3,000 tests                                                                                                                         |
| Spec kinds, files            | Behavior 73, server rendering 48, accessibility 41, right to left 36, screen reader 32, kitchen sink 32, enhancements 32, render 27, count gates 18 |
| Fixture folders              | 151                                                                                                                                                 |
| Base fixtures per framework  | React 146, Vue 143, web 135, Solid 107, Svelte 106                                                                                                  |
| Other fixtures per framework | Server rendering 48, except web with none. Data 8.                                                                                                  |
| Unit test files              | React 98, Svelte 91, Vue 74, Solid 67, web 56                                                                                                       |
| Examples                     | 59 folders per framework, 591 files for Vue                                                                                                         |
| Docs pages                   | 71 per framework                                                                                                                                    |

### Sources

- [vercel-labs/ui](https://github.com/vercel-labs/ui), cloned at `a349d52`
- [stablyai/orca](https://github.com/stablyai/orca), README
- [Angular: custom controls for Signal Forms](https://angular.dev/guide/forms/signals/custom-controls)
- [Angular CLI MCP server](https://angular.dev/ai/mcp)
- [Angular Agent Skills](https://angular.dev/ai/agent-skills)
- npm registry metadata for the versions under Target stack, read on 23 Nov 2026
