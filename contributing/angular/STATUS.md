# Status

One row per task in [TASKS.md](TASKS.md). The coordinator keeps it: a row changes when a task's branch opens, when its review ends and when it lands on `angular`.

- **Specs** counts the task's spec files on `angular` against `solid`: passed, failed, skipped.
- **Review** is Astra's verdict on the pull request.
- **State** is one of not started, in progress, verified, blocked or landed.

## Phase 0: foundation

| ID   | Task                                         | Branch                            | Specs                                | Review   | State    |
| ---- | -------------------------------------------- | --------------------------------- | ------------------------------------ | -------- | -------- |
| P0.1 | Fork and integration branch                  | `angular-p0.1-integration-branch` |                                      | None yet | Verified |
| P0.2 | TypeScript 6 in the catalog                  | `angular-p0.2-typescript-6`       |                                      | None yet | Verified |
| P0.3 | `packages/angular` skeleton and build script | `angular-p0.3-package-skeleton`   |                                      | None yet | Verified |
| P0.4 | Angular in the playground                    | `angular-p0.4-playground`         | Tabs: 58 fail at `open()` until P1.4 | None yet | Verified |
| P0.5 | Test wiring                                  | `angular-p0.5-test-wiring`        |                                      | None yet | Verified |
| P0.6 | Agent setup                                  | `angular-p0.6-agent-setup`        |                                      | None yet | Verified |

## Phase 1: contract and first slice

| ID   | Task                                         | Branch | Specs | Review | State       |
| ---- | -------------------------------------------- | ------ | ----- | ------ | ----------- |
| P1.1 | Generic root, `use-primitive.ts`             |        |       |        | Not started |
| P1.2 | Generic part, `use-part.ts`                  |        |       |        | Not started |
| P1.3 | `UiRoot`, `UiPart` and the `primitive` entry |        |       |        | Not started |
| P1.7 | Spec-branch audit                            |        |       |        | Not started |
| P1.8 | Contract                                     |        |       |        | Not started |
| P1.4 | Tabs                                         |        |       |        | Not started |
| P1.5 | Rating                                       |        |       |        | Not started |
| P1.6 | Popover                                      |        |       |        | Not started |

## Wave 1: composition

| ID  | Task        | Branch | Specs | Review | State       |
| --- | ----------- | ------ | ----- | ------ | ----------- |
| C01 | Accordion   |        |       |        | Not started |
| C02 | Collapsible |        |       |        | Not started |
| C03 | Avatar      |        |       |        | Not started |
| C04 | Meter       |        |       |        | Not started |
| C05 | Pagination  |        |       |        | Not started |
| C06 | Timeline    |        |       |        | Not started |
| C07 | Button      |        |       |        | Not started |
| C08 | Separator   |        |       |        | Not started |
| C09 | Toggle      |        |       |        | Not started |

## Wave 2: form controls

| ID  | Task              | Branch | Specs | Review | State       |
| --- | ----------------- | ------ | ----- | ------ | ----------- |
| C10 | Field             |        |       |        | Not started |
| C11 | Input             |        |       |        | Not started |
| C12 | Textarea          |        |       |        | Not started |
| S1  | Form fixtures     |        |       |        | Not started |
| C13 | Checkbox          |        |       |        | Not started |
| C14 | Radio             |        |       |        | Not started |
| C15 | Switch            |        |       |        | Not started |
| S2  | Forms fixtures    |        |       |        | Not started |
| C16 | Segmented Control |        |       |        | Not started |
| C17 | OTP Input         |        |       |        | Not started |
| C18 | Number Input      |        |       |        | Not started |
| C19 | Password Input    |        |       |        | Not started |
| C20 | File Input        |        |       |        | Not started |
| C21 | Slider            |        |       |        | Not started |
| C22 | Label             |        |       |        | Not started |
| C23 | Progress          |        |       |        | Not started |

## Wave 3: popups

| ID  | Task                 | Branch | Specs | Review | State       |
| --- | -------------------- | ------ | ----- | ------ | ----------- |
| C24 | Menu                 |        |       |        | Not started |
| C25 | Dialog               |        |       |        | Not started |
| C26 | Alert Dialog         |        |       |        | Not started |
| C27 | Drawer               |        |       |        | Not started |
| C28 | Tooltip              |        |       |        | Not started |
| C29 | Hover Card           |        |       |        | Not started |
| S3  | Popup cross-fixtures |        |       |        | Not started |
| C30 | Navigation Menu      |        |       |        | Not started |
| C31 | Menubar              |        |       |        | Not started |
| C32 | Toolbar              |        |       |        | Not started |
| C33 | Overlays             |        |       |        | Not started |
| C34 | Toast                |        |       |        | Not started |

## Wave 4: lists

| ID  | Task                        | Branch | Specs | Review | State       |
| --- | --------------------------- | ------ | ----- | ------ | ----------- |
| C35 | Listbox                     |        |       |        | Not started |
| C36 | Select                      |        |       |        | Not started |
| C37 | Combobox                    |        |       |        | Not started |
| C38 | Autocomplete                |        |       |        | Not started |
| C39 | Command                     |        |       |        | Not started |
| C40 | Trigger Menu                |        |       |        | Not started |
| C41 | Token Input                 |        |       |        | Not started |
| C42 | Tree                        |        |       |        | Not started |
| S4  | List and popup shared specs |        |       |        | Not started |

## Wave 5: dates and direct manipulation

| ID  | Task          | Branch | Specs | Review | State       |
| --- | ------------- | ------ | ----- | ------ | ----------- |
| C43 | Calendar      |        |       |        | Not started |
| C44 | Time Input    |        |       |        | Not started |
| C45 | Date Input    |        |       |        | Not started |
| C46 | Date Picker   |        |       |        | Not started |
| C47 | Color Picker  |        |       |        | Not started |
| C48 | Image Cropper |        |       |        | Not started |
| C49 | Carousel      |        |       |        | Not started |
| C50 | Resizable     |        |       |        | Not started |
| C51 | Scroll Area   |        |       |        | Not started |
| C52 | Waterfall     |        |       |        | Not started |
| C53 | Preferences   |        |       |        | Not started |

## Utility entries

| ID  | Task                           | Branch | Specs | Review | State       |
| --- | ------------------------------ | ------ | ----- | ------ | ----------- |
| U1  | Re-export entries and the root |        |       |        | Not started |
| U2  | `async-options`                |        |       |        | Not started |
| U3  | `shortcuts`                    |        |       |        | Not started |

## Phase 3: parity

| ID    | Task                                 | Branch | Specs | Review | State       |
| ----- | ------------------------------------ | ------ | ----- | ------ | ----------- |
| 3A.1  | SSR harness                          |        |       |        | Not started |
| 3A.2  | SSR fixtures, wave 1                 |        |       |        | Not started |
| 3A.3  | SSR fixtures, wave 2                 |        |       |        | Not started |
| 3A.4  | SSR fixtures, wave 3                 |        |       |        | Not started |
| 3A.5  | SSR fixtures, wave 4                 |        |       |        | Not started |
| 3A.6  | SSR fixtures, wave 5                 |        |       |        | Not started |
| 3B.1  | Data project and Menu                |        |       |        | Not started |
| 3B.2  | List data fixtures                   |        |       |        | Not started |
| 3B.3  | Tree data fixture                    |        |       |        | Not started |
| 3B.4  | Sheet project                        |        |       |        | Not started |
| 3C.1  | Signal Forms                         |        |       |        | Not started |
| 3C.2  | Reactive and template-driven forms   |        |       |        | Not started |
| 3D.1  | Package consumer                     |        |       |        | Not started |
| 3D.2  | Size budgets                         |        |       |        | Not started |
| 3D.3  | Leaks                                |        |       |        | Not started |
| 3D.4  | Count gates                          |        |       |        | Not started |
| 3D.5  | CI and planner                       |        |       |        | Not started |
| 3D.6  | Release                              |        |       |        | Not started |
| 3E.1  | Examples harness                     |        |       |        | Not started |
| 3E.2  | Component examples, slice and wave 1 |        |       |        | Not started |
| 3E.3  | Component examples, wave 2           |        |       |        | Not started |
| 3E.4  | Component examples, wave 3           |        |       |        | Not started |
| 3E.5  | Component examples, wave 4           |        |       |        | Not started |
| 3E.6  | Component examples, wave 5           |        |       |        | Not started |
| 3E.7  | Other example groups                 |        |       |        | Not started |
| 3E.8  | Docs site wiring                     |        |       |        | Not started |
| 3E.9  | Guide and utility pages              |        |       |        | Not started |
| 3E.10 | Component pages, slice and wave 1    |        |       |        | Not started |
| 3E.11 | Component pages, wave 2              |        |       |        | Not started |
| 3E.12 | Component pages, wave 3              |        |       |        | Not started |
| 3E.13 | Component pages, wave 4              |        |       |        | Not started |
| 3E.14 | Component pages, wave 5              |        |       |        | Not started |
| 3E.15 | Shipped skill and prose              |        |       |        | Not started |
| 3F.1  | Lists flipped                        |        |       |        | Not started |
