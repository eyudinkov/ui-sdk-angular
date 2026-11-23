import { Component } from "@angular/core"
import { createApplication } from "@angular/platform-browser"

@Component({ selector: "tabs-fixture", template: "" })
class Fixture {}

async function mount(root: HTMLElement) {
  const application = await createApplication()
  application.bootstrap(Fixture, root)
}

export { Fixture, mount }
