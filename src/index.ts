import { createCanvas, drawCanvas, resizeCanvas } from "./canvas";
import { createTree, item, Item, root } from "./core";
import { div } from "./html";
import { createSidepanel } from "./sidepanel";

const tree = createTree(
  root([
    item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
    item("Fooo"),
    item("Bar"),
  ])
);

const canvas = createCanvas();

const sidepanel = createSidepanel({ onChange: () => drawCanvas(canvas, tree) });

const app = div(
  "page",
  div("col", div("header"), canvas.container, div("footer")),
  sidepanel
);

const resizeAndDraw = () => {
  resizeCanvas(canvas);
  drawCanvas(canvas, tree);
};

document.body.appendChild(app);

// waiting for elements to be added into the DOM
resizeAndDraw();

window.addEventListener("resize", resizeAndDraw);
