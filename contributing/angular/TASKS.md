# Task list

Exported from the plan document on 2026-11-23, revision 15, with [PLAN.md](PLAN.md). Where each task stands is in [STATUS.md](STATUS.md).

108 tasks cover every plan step and all 56 component entries, and each one runs the same six stages. A task is done when Angular matches the existing adapters, with nothing added.

## Task counts

| Group                     | Tasks | Covers                                                                                                     |
| ------------------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| Phase 0                   | 6     | Toolchain, package skeleton, test project and agent setup.                                                 |
| Phase 1                   | 8     | The generic layer, Tabs, Rating, Popover and the contract.                                                 |
| Components, C01 to C53    | 53    | The other 48 components and 5 extra entries: Textarea, Alert Dialog, Overlays, Time Input and Preferences. |
| Shared fixtures, S1 to S4 | 4     | Fixtures and spec files that several components share.                                                     |
| Utilities, U1 to U3       | 3     | 11 utility entries and the root entry.                                                                     |
| Phase 3                   | 34    | Server rendering, data, forms, packaging, examples and docs.                                               |

Ids double as issue titles and branch names, such as `angular/c24-menu`. Counts come from commit `a349d52`.

## Parity rule

Every task is held to the existing adapters, so "the same functionality" has five fixed meanings.

- **Same surface.** Every part, option, slot prop, callback, controller method and helper that `@ui-sdk/react/<name>` exports, read from the primitive's schema in core. The 56 entries export 378 parts between them.
- **Same behavior.** Every spec file that runs on the `solid` project runs on `angular` and passes. Solid is the reference because, like Angular, it has no kitchen-sink fixtures.
- **Same tests.** No assertion under `tests/specs/` changes. A spec may only gain Angular in a `framework` branch it already has.
- **Same core.** Nothing under `packages/core/` changes behavior.
- **Same shape, except where decided.** Angular differs from the other adapters only where decisions D1 to D5 in the plan say so.

| Scope                                                                       | Spec files                        | Tests | Fixtures | Where              |
| --------------------------------------------------------------------------- | --------------------------------- | ----- | -------- | ------------------ |
| Behavior, accessibility, right to left, screen reader, render, enhancements | 259                               | 2,689 | 90       | Phases 1 and 2     |
| Server rendering                                                            | 48                                | 140   | 48       | Phase 3, track A   |
| Data fixtures                                                               | Reruns of the list and menu specs |       | 8        | Phase 3, track B   |
| Count gates                                                                 | 14                                | 35    | 16       | Phase 3, task 3D.4 |
| Leaks                                                                       | 1                                 | 12    | 1        | Phase 3, task 3D.3 |

## Pipeline

Every task runs the same six stages in order, and a stage starts only when the one before it has left its exit behind. A finding in REVIEW sends the task back to BUILD.

| Stage  | Command   | Who            | What it does for a component                                                                                                                                                                                              | Exit                                                                                                  |
| ------ | --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| DEFINE | `/spec`   | Opus 5.5, high | Writes the parity spec from core's schema and the React and Vue entries: every part, option, slot prop, callback and controller method, its form and presence behavior, the fixtures to build and the spec files to pass. | `contributing/angular/specs/<id>.md`, with its part list matching `@ui-sdk/react/<name>` one for one. |
| PLAN   | `/plan`   | Opus 5.5, high | Orders the work into slices: the entry file, then one fixture at a time, then unit tests. Names the contract sections it relies on and every `framework` branch in its spec files.                                        | A slice list in the same file. No slice is larger than one fixture.                                   |
| BUILD  | `/build`  | Opus 5.5, high | Builds slice by slice in `packages/angular/src/<name>.ts` and `apps/playground/src/fixtures/<fixture>/angular.ts`. Core and spec assertions stay untouched.                                                               | Commits on `angular/<id>-<name>`.                                                                     |
| VERIFY | `/test`   | Opus 5.5, high | Runs lint, format, typecheck, unit tests and the task's spec files on `angular`, then compares skip counts with `solid`.                                                                                                  | A handoff note with exit codes and counts.                                                            |
| REVIEW | `/review` | Astra, xhigh   | Reviews the pull request against the spec from DEFINE and the review brief in the plan, and proves each finding.                                                                                                          | A clean verdict on the pull request.                                                                  |
| SHIP   | `/ship`   | Coordinator    | Re-runs the gates, merges into `angular` and updates `STATUS.md`. Nothing goes to npm before Gate 3.                                                                                                                      | A merged pull request and a done row in `STATUS.md`.                                                  |

The model settings are required: Opus 5.5 at high effort for DEFINE to VERIFY, and GPT-6.2 Astra at xhigh effort for REVIEW.

For a step task, DEFINE settles what its row below lists, and VERIFY produces the proof its row names. The other four stages are the same.

The commands come from the [agent-skills](https://github.com/addyosmani/agent-skills) pack. Its README says to use `/agent-skills:review` where `/review` clashes with a built-in command, and that Codex invokes skills by name with `@`. Astra therefore runs the pack's review skill, `code-review-and-quality`, with the review brief.

## Phase 0: foundation

Six step tasks, run in order by one Opus session.

| ID   | Task                                         | DEFINE settles                                                                         | VERIFY proves                                                                                      |
| ---- | -------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| P0.1 | Fork and integration branch                  | Branch names and the rebase rhythm against upstream `main`.                            | `pnpm install`, `pnpm typecheck` and `pnpm build` pass untouched.                                  |
| P0.2 | TypeScript 6 in the catalog                  | Which workspaces move, and the fallback if a tool breaks.                              | `pnpm typecheck`, `pnpm build` and `pnpm check:packages --build` pass for the five adapters.       |
| P0.3 | `packages/angular` skeleton and build script | The entry map, the peers and the `ngc` partial settings.                               | `pnpm --filter @ui-sdk/angular build` emits `dist`, and the manifest check passes.                 |
| P0.4 | Angular in the playground                    | The plugin's scope, `tsconfig.angular.json` and the JIT fallback.                      | An empty `tabs/angular.ts` renders, and `tabs.spec.ts` still passes on the five existing projects. |
| P0.5 | Test wiring                                  | The `angular` project, the planner list and console-error capture.                     | `npx playwright test --project angular --list` shows only specs that have a fixture.               |
| P0.6 | Agent setup                                  | The Angular expert files, Angular's MCP server and skill, and `contributing/angular/`. | Astra answers a question in expert mode from its own worktree.                                     |

## Phase 1: contract and first slice

Eight tasks, serial, ending at Gate 1. Five are steps and three are components.

| ID   | Task                                         | DEFINE settles                                                                  | VERIFY proves                                         |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| P1.1 | Generic root, `use-primitive.ts`             | Instance, handle, tokens, options, models and lifecycle.                        | Unit tests for options, controlled state and destroy. |
| P1.2 | Generic part, `use-part.ts`                  | Attributes, binding after render, subscription, the state signal and presence.  | The ten sharp-edge tests from the plan.               |
| P1.3 | `UiRoot`, `UiPart` and the `primitive` entry | Typing from the primitive, and `providePrimitive` for named directives.         | The README's search field works as a fixture.         |
| P1.7 | Spec-branch audit                            | Every `framework` branch in the slice's spec files, and Angular's side of each. | The list, in the pull request.                        |
| P1.8 | Contract                                     | `CONTRACT.md`, and D1 to D5 in `decisions.md` as built.                         | Astra's review is clean, and you sign off.            |

| ID   | Component | Parts | Needs first  | Fixtures to build           | Specs to pass      | Vue tests to port |
| ---- | --------- | ----- | ------------ | --------------------------- | ------------------ | ----------------- |
| P1.4 | Tabs      | 6     | P1.1 to P1.3 | `tabs`, `tabs-render`       | 6 files, 64 tests  | 1                 |
| P1.5 | Rating    | 2     | P1.1 to P1.3 | `rating`                    | 1 file, 14 tests   |                   |
| P1.6 | Popover   | 8     | P1.1 to P1.3 | `popover`, `popover-render` | 8 files, 117 tests | 1                 |

P1.6's eight files include `popup.spec.ts` and `position.spec.ts`, which open the `popover` fixture. That fixture also renders a small Menu, so the tests under "a menu inside the popover" wait for C24.

## Wave 1: composition

Nine components, 39 spec files and 295 tests. All but C09 can start together once Gate 1 passes.

| ID  | Component   | Parts | Needs first | Fixtures to build                   | Specs to pass     | Vue tests to port |
| --- | ----------- | ----- | ----------- | ----------------------------------- | ----------------- | ----------------- |
| C01 | Accordion   | 5     |             | `accordion`, `accordion-render`     | 6 files, 61 tests | 1                 |
| C02 | Collapsible | 3     |             | `collapsible`, `collapsible-render` | 7 files, 47 tests | 2                 |
| C03 | Avatar      | 3     |             | `avatar`                            | 2 files, 14 tests | 0                 |
| C04 | Meter       | 5     |             | `meter`, `meter-render`             | 6 files, 18 tests | 0                 |
| C05 | Pagination  | 9     |             | `pagination`, `pagination-render`   | 6 files, 41 tests | 0                 |
| C06 | Timeline    | 7     |             | `timeline`                          | 3 files, 40 tests | 0                 |
| C07 | Button      | 1     |             | None                                | With C09          | 1                 |
| C08 | Separator   | 1     |             | None                                | With C09          | 0                 |
| C09 | Toggle      | 3     | C07, C08    | `toggle`, `toggle-render`           | 9 files, 74 tests | 1                 |

C07 and C08 have no fixture of their own: `button.spec.ts` and `separator.spec.ts` open the `toggle` fixture, so C09 verifies all three. C02's seven files include `source.spec.ts`, which opens the `collapsible` fixture.

## Wave 2: form controls

Thirteen components, the Textarea entry and two shared-fixture tasks, with 56 spec files and 471 tests. Field comes first, because seven other fixtures render it.

| ID  | Task              | Parts | Needs first        | Fixtures to build                                            | Specs to pass       | Vue tests to port |
| --- | ----------------- | ----- | ------------------ | ------------------------------------------------------------ | ------------------- | ----------------- |
| C10 | Field             | 8     |                    | None                                                         | With S1 and S2      | 3                 |
| C11 | Input             | 3     |                    | None                                                         | With S1             | 0                 |
| C12 | Textarea          | 1     |                    | None                                                         | With S1             | 0                 |
| S1  | Form fixtures     |       | C10, C11, C12      | `form`, `form-render`                                        | 8 files, 49 tests   |                   |
| C13 | Checkbox          | 3     |                    | None                                                         | With S2             | 1                 |
| C14 | Radio             | 3     |                    | None                                                         | With S2             | 0                 |
| C15 | Switch            | 2     |                    | None                                                         | With S2             | 0                 |
| S2  | Forms fixtures    |       | C10, C13, C14, C15 | `forms`, `forms-render`, `field-choice-card`, `field-radios` | 13 files, 117 tests |                   |
| C16 | Segmented Control | 3     |                    | `segmented-control`                                          | 1 file, 19 tests    | 0                 |
| C17 | OTP Input         | 4     |                    | `otp-input`                                                  | 5 files, 30 tests   | 0                 |
| C18 | Number Input      | 7     | C10                | `number-input`, `number-input-scrub`                         | 6 files, 61 tests   | 0                 |
| C19 | Password Input    | 3     | C10                | `password-input`, `password-input-render`                    | 6 files, 41 tests   | 0                 |
| C20 | File Input        | 6     | C10                | `file-input`                                                 | 4 files, 59 tests   | 1                 |
| C21 | Slider            | 6     | C10, C18           | `slider`, `slider-render`                                    | 6 files, 63 tests   | 1                 |
| C22 | Label             | 1     | C13, C14, C18, C21 | `label`                                                      | 1 file, 8 tests     | 0                 |
| C23 | Progress          | 5     | C03, C17           | `progress`, `progress-render`                                | 6 files, 24 tests   | 0                 |

S1 runs `form.*`, `input.spec.ts`, `textarea.spec.ts` and `field.set.spec.ts`. S2 runs `forms.*`, `checkbox.*`, `radio.*`, `switch.spec.ts` and the other two `field.*` files. The six components those fixtures render reach VERIFY with unit tests, and their specs pass in S1 and S2.

## Wave 3: popups

Nine components, the Alert Dialog and Overlays entries and one shared-fixture task, with 63 spec files and 738 tests. Menu goes first, since four other fixtures render it.

| ID  | Task                 | Parts | Needs first            | Fixtures to build                                                              | Specs to pass      | Vue tests to port |
| --- | -------------------- | ----- | ---------------------- | ------------------------------------------------------------------------------ | ------------------ | ----------------- |
| C24 | Menu                 | 18    | P1.6                   | `menu`, `menu-groups`, `menu-render`, `menu-unmount`                           | 8 files, 94 tests  | 2                 |
| C25 | Dialog               | 8     | With C26               | `dialog`, `dialog-render`                                                      | 6 files, 120 tests | 1                 |
| C26 | Alert Dialog         | 8     | C25                    | None                                                                           | With C25           | 0                 |
| C27 | Drawer               | 10    |                        | `drawer`                                                                       | 5 files, 82 tests  | 1                 |
| C28 | Tooltip              | 5     | P1.6                   | `tooltip`, `tooltip-render`                                                    | 6 files, 63 tests  | 1                 |
| C29 | Hover Card           | 4     |                        | `hover-card`, `hover-card-render`                                              | 6 files, 32 tests  | 0                 |
| S3  | Popup cross-fixtures |       | P1.4, P1.6, C24 to C29 | `popup-payloads`, `dialog-patterns`, `menu-cases`, `alignment`, `hover-popups` | 8 files, 93 tests  |                   |
| C30 | Navigation Menu      | 9     |                        | `navigation-menu`, `navigation-menu-bound`, `navigation-menu-render`           | 7 files, 88 tests  | 1                 |
| C31 | Menubar              | 1     | C24                    | `menubar`                                                                      | 5 files, 45 tests  | 1                 |
| C32 | Toolbar              | 6     | C09, C18, C24          | `toolbar`, `toolbar-render`                                                    | 6 files, 42 tests  | 0                 |
| C33 | Overlays             | 1     | C26, with C34          | None                                                                           | With C34           | 0                 |
| C34 | Toast                | 6     | C25, C26, with C33     | `toast`                                                                        | 6 files, 79 tests  | 1                 |

C24 also adds the nested Menu to the `popover` fixture from P1.6 and turns its waiting tests green. The `dialog` fixture renders Alert Dialog too, so C25 and C26 share one pull request. S3 runs the four `*.payload.spec.ts` files, `dialog.patterns.spec.ts`, `menu.cases.spec.ts`, `alignment.spec.ts` and `hover-popups.spec.ts`.

Overlays renders Alert Dialog and Toast's parts, and the `toast` fixture renders the overlay host, so C33 and C34 share one pull request as well.

## Wave 4: lists

Eight components and one shared-spec task, with 53 spec files and 600 tests. Select, Combobox and Menu are the three largest entries, so each gets a worktree to itself.

| ID  | Task                        | Parts | Needs first                     | Fixtures to build                                 | Specs to pass      | Vue tests to port |
| --- | --------------------------- | ----- | ------------------------------- | ------------------------------------------------- | ------------------ | ----------------- |
| C35 | Listbox                     | 8     |                                 | `listbox`, `listbox-picker`, `listbox-render`     | 7 files, 107 tests | 1                 |
| C36 | Select                      | 21    | C10                             | `select`, `select-render`                         | 9 files, 96 tests  | 3                 |
| C37 | Combobox                    | 26    |                                 | `combobox`, `combobox-render`, `combobox-virtual` | 9 files, 115 tests | 0                 |
| C38 | Autocomplete                | 17    |                                 | `autocomplete`, `autocomplete-render`             | 9 files, 77 tests  | 0                 |
| C39 | Command                     | 14    |                                 | `command`, `command-render`, `command-virtual`    | 8 files, 50 tests  | 1                 |
| C40 | Trigger Menu                | 13    | C12                             | `trigger-menu`                                    | 2 files, 50 tests  | 1                 |
| C41 | Token Input                 | 4     | C40                             | `token-input`                                     | 1 file, 32 tests   | 1                 |
| C42 | Tree                        | 7     |                                 | `tree`, `tree-links`                              | 5 files, 45 tests  | 0                 |
| S4  | List and popup shared specs |       | P1.4, C09, C24, C30, C36 to C40 | `item-icons`, `wrapped-content`                   | 3 files, 28 tests  |                   |

The component rows already include the shared specs that open several of their fixtures: `list.*`, `presentation.spec.ts` and `csp.spec.ts` land on the last component they need. S4 runs the two `item-icon.*` files and `wrapped-content.spec.ts`.

## Wave 5: dates and direct manipulation

Nine components and the Time Input and Preferences entries, with 33 spec files and 390 tests. Only the date tasks depend on each other.

| ID  | Component     | Parts | Needs first | Fixtures to build                   | Specs to pass     | Vue tests to port |
| --- | ------------- | ----- | ----------- | ----------------------------------- | ----------------- | ----------------- |
| C43 | Calendar      | 11    |             | `calendar`                          | 4 files, 38 tests | 1                 |
| C44 | Time Input    | 2     |             | None                                | With C45          | 0                 |
| C45 | Date Input    | 2     | C10, C44    | `date-input`                        | 3 files, 39 tests | 1                 |
| C46 | Date Picker   | 17    | C10, C43    | `date-picker`, `date-picker-field`  | 2 files, 30 tests | 1                 |
| C47 | Color Picker  | 12    |             | `color-picker`                      | 1 file, 13 tests  | 0                 |
| C48 | Image Cropper | 9     |             | `image-cropper`                     | 2 files, 17 tests | 0                 |
| C49 | Carousel      | 9     |             | `carousel`, `carousel-render`       | 6 files, 88 tests | 1                 |
| C50 | Resizable     | 3     |             | `resizable`, `resizable-render`     | 6 files, 60 tests | 1                 |
| C51 | Scroll Area   | 7     |             | `scroll-area`, `scroll-area-render` | 6 files, 81 tests | 1                 |
| C52 | Waterfall     | 11    |             | `waterfall`                         | 3 files, 24 tests | 2                 |
| C53 | Preferences   | 1     |             | None                                | Unit tests only   | 1                 |

The `date-input` fixture renders Time Input, so C45 verifies C44. Date Picker's 17 parts include the Calendar parts it re-exports.

## Utility entries

Three tasks cover the 11 utility entries and the package root. They run beside wave 1.

| ID  | Task                           | Scope                                                                                                                                                               | VERIFY proves                                                                      |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| U1  | Re-export entries and the root | `agent`, `observe`, `history`, `gesture`, `image`, `color`, `date`, `number` and `text-match`, plus the root entry. None carries framework code in the Vue adapter. | Each entry exports what `@ui-sdk/vue/<name>` exports, and `pnpm typecheck` passes. |
| U2  | `async-options`                | A signal-based wrapper over core's async options.                                                                                                                   | Unit tests ported from Vue's two `async-options` test files.                       |
| U3  | `shortcuts`                    | The Angular counterparts of `useShortcut` and `useShortcutHint`, released through `DestroyRef`.                                                                     | Unit tests, and the `shortcut` inputs work in the Menu and Dialog specs.           |

The twelfth utility entry, `primitive`, is task P1.3.

## Phase 3: parity

Thirty-four tasks in six tracks, ending at Gate 3. Tracks A and C can start on the slice right after Gate 1, and track E runs only if decision D10 keeps examples and docs in scope.

| ID    | Task                                 | Scope                                                                                                                                                          | VERIFY proves                                                                                    |
| ----- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 3A.1  | SSR harness                          | The `/__ssr` renderer, a hydrate helper that records hydration errors, the `angular-ssr` project, and the `-ssr` fixtures of Tabs, Rating and Popover.         | `tabs.ssr.spec.ts`, `rating.ssr.spec.ts` and `popover.ssr.spec.ts` pass with no hydration error. |
| 3A.2  | SSR fixtures, wave 1                 | 7 fixtures: `accordion`, `avatar`, `collapsible`, `meter`, `pagination`, `timeline`, `toggle`.                                                                 | Their `.ssr` spec files pass on `angular-ssr`.                                                   |
| 3A.3  | SSR fixtures, wave 2                 | 11 fixtures: `form`, `forms`, `field-radios`, `file-input`, `label`, `number-input`, `otp-input`, `password-input`, `progress`, `segmented-control`, `slider`. | Their `.ssr` spec files pass.                                                                    |
| 3A.4  | SSR fixtures, wave 3                 | 9 fixtures: `dialog`, `drawer`, `hover-card`, `menu`, `menubar`, `navigation-menu`, `toast`, `toolbar`, `tooltip`.                                             | Their `.ssr` spec files pass, with `controller-shortcuts.ssr.spec.ts`.                           |
| 3A.5  | SSR fixtures, wave 4                 | 9 fixtures: `autocomplete`, `combobox`, `command`, `item-icons`, `listbox`, `select`, `token-input`, `tree`, `trigger-menu`.                                   | Their `.ssr` spec files pass.                                                                    |
| 3A.6  | SSR fixtures, wave 5                 | 9 fixtures: `calendar`, `carousel`, `color-picker`, `date-input`, `date-picker`, `image-cropper`, `resizable`, `scroll-area`, `waterfall`.                     | Their `.ssr` spec files pass. All 48 files and 140 tests are then green.                         |
| 3B.1  | Data project and Menu                | The `angular-data` project, the data rendering helper, and the `menu` and `menu-cases` data fixtures.                                                          | Menu's spec files pass on `angular-data`.                                                        |
| 3B.2  | List data fixtures                   | `listbox`, `select`, `combobox`, `autocomplete` and `command`.                                                                                                 | Their spec files pass on `angular-data`.                                                         |
| 3B.3  | Tree data fixture                    | `tree`.                                                                                                                                                        | Tree's spec files pass on `angular-data`.                                                        |
| 3B.4  | Sheet project                        | `angular-sheet`: Menu, Popover, Dialog, Select, Combobox and Autocomplete with `?presentation=sheet`.                                                          | Those six base spec files pass on `angular-sheet`.                                               |
| 3C.1  | Signal Forms                         | Every control whose primitive takes `name` binds with `[formField]`: value or checked, disabled, required, errors and touched.                                 | A unit test per control.                                                                         |
| 3C.2  | Reactive and template-driven forms   | The same controls under `formControl` and `ngModel`.                                                                                                           | A unit test per control.                                                                         |
| 3D.1  | Package consumer                     | `scripts/package-consumers/angular/` and the peers list in `check-packages.mjs`.                                                                               | `pnpm check:packages --build` passes.                                                            |
| 3D.2  | Size budgets                         | An Angular compile step in `scripts/size.mjs` and a `size-budget.json` row per entry.                                                                          | `pnpm size` passes.                                                                              |
| 3D.3  | Leaks                                | `fixtures/leaks/angular.ts`, which renders 18 components.                                                                                                      | `leaks.spec.ts` passes on `angular`: 12 tests.                                                   |
| 3D.4  | Count gates                          | The 16 `-perf` fixtures and Angular entries in `tests/perf/budgets.ts`.                                                                                        | The 14 `.counts.spec.ts` files pass: 35 tests.                                                   |
| 3D.5  | CI and planner                       | The project list in `ci.yml`, and the data, SSR and sheet projects in `affected-specs.mjs`.                                                                    | `pnpm test:pr --dry` plans Angular projects for an adapter change.                               |
| 3D.6  | Release                              | A changeset, the package README and the Angular output of `pnpm docs:packages`.                                                                                | `pnpm build` and `pnpm docs:packages` pass.                                                      |
| 3E.1  | Examples harness                     | `builds.angular` in `examples/vite.config.ts`, `scripts/build.mjs`, `mount/angular.ts`, `prerender/angular.ts` and `shared/angular/`.                          | `pnpm --filter examples build` passes with one Angular example.                                  |
| 3E.2  | Component examples, slice and wave 1 | An `angular/` folder beside `vue/` for each of those components, file for file.                                                                                | The examples build and prerender.                                                                |
| 3E.3  | Component examples, wave 2           | The same for wave 2.                                                                                                                                           | The examples build and prerender.                                                                |
| 3E.4  | Component examples, wave 3           | The same for wave 3.                                                                                                                                           | The examples build and prerender.                                                                |
| 3E.5  | Component examples, wave 4           | The same for wave 4.                                                                                                                                           | The examples build and prerender.                                                                |
| 3E.6  | Component examples, wave 5           | The same for wave 5. All 54 component folders then have Angular.                                                                                               | The examples build and prerender.                                                                |
| 3E.7  | Other example groups                 | `core`, `guides`, `shortcuts` and `experiments`.                                                                                                               | `pnpm --filter examples build` passes for every framework.                                       |
| 3E.8  | Docs site wiring                     | `frameworks.ts`, `llms.ts`, `package-docs.ts`, `setup-prompts.ts`, `next.config.mjs`, `meta.json` and `docs-dev.sh`.                                           | The Angular section builds, and `setup-prompts.test.ts` passes.                                  |
| 3E.9  | Guide and utility pages              | 13 guide pages and 2 utility pages under `content/docs/angular/`.                                                                                              | `pnpm test:docs` passes for those pages.                                                         |
| 3E.10 | Component pages, slice and wave 1    | One page per component, mirroring the Vue page.                                                                                                                | `pnpm test:docs` passes for those pages.                                                         |
| 3E.11 | Component pages, wave 2              | The same for wave 2.                                                                                                                                           | `pnpm test:docs` passes for those pages.                                                         |
| 3E.12 | Component pages, wave 3              | The same for wave 3.                                                                                                                                           | `pnpm test:docs` passes for those pages.                                                         |
| 3E.13 | Component pages, wave 4              | The same for wave 4.                                                                                                                                           | `pnpm test:docs` passes for those pages.                                                         |
| 3E.14 | Component pages, wave 5              | The same for wave 5. All 56 component pages then exist.                                                                                                        | `pnpm test:docs` passes for those pages.                                                         |
| 3E.15 | Shipped skill and prose              | `packages/core/skills/ui-sdk/SKILL.md`, `README.md`, `AGENTS.md`, `contributing/*.md` and `tests/README.md`.                                                   | `pnpm lint` and `pnpm format` pass.                                                              |
| 3F.1  | Lists flipped                        | `angular` joins `check-coverage.mjs`, `public-exports.mjs` and `expert-scope.mjs`.                                                                             | `pnpm lint` passes with Angular held to every rule.                                              |

## Out of scope

Forty-eight spec files have no fixture outside the frameworks they test, so no Angular task covers them.

- **Kitchen sinks, 32 files.** They run on React, Vue and web only.
- **Web components only, 6 files.** `elements`, `web-data-lists`, `web-menu`, `web-popups`, `web-lifecycle` and `web-templates`.
- **One framework each, 3 files.** `vue-updates`, `react-transitions` and `svelte-outro`.
- **React, Vue or web fixtures only, 7 files.** `agent`, `cached-page`, `typed-before-hydration`, and the count gates of Collapsible, Drawer, Tree and Waterfall.
