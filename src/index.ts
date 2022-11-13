import { create, updateCanvas } from "./canvas";
import { div } from "./html";
import { createSidepanel } from "./sidepanel";

const app = div(
  "page",
  div("col", div("header"), create(), div("footer")),
  createSidepanel({ onChange: updateCanvas })
);
document.body.appendChild(app);
