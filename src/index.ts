import { create } from "./canvas";
import { div } from "./html";

const app = div("col", div("header"), create(), div("footer"));
document.body.appendChild(app);
