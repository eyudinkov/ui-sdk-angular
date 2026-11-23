import { Directive } from "@angular/core"

/**
 * The root of a primitive written outside the library, on the element that
 * holds its parts.
 */
@Directive({ selector: "[uiRoot]", exportAs: "uiRoot" })
class UiRoot {}

export { UiRoot }
