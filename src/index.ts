import { createCanvas, drawCanvas, resizeCanvas } from "./canvas";
import {
  createTree,
  getItemAbove,
  getItemBelow,
  isRoot,
  item,
  Item,
  root,
} from "./core";
import { div } from "./html";
import { createSidepanel, toggleSidebarVisibility } from "./sidepanel";

const tree = createTree(
  root([
    item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
    item("Fooo", [
      item("Music", [
        item("Ambient"),
        item("Electro"),
        item("Metal", [
          item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
        ]),
      ]),
    ]),
    item("Bar"),
  ])
);
const canvas = createCanvas();
const redrawCanvas = () => drawCanvas(canvas, tree);

const sidepanel = createSidepanel({ onChange: redrawCanvas });

const app = div(
  "page",
  div("col", div("header"), canvas.container, div("footer")),
  sidepanel
);

const resizeAndDraw = () => {
  resizeCanvas(canvas);
  redrawCanvas();
};

document.body.appendChild(app);

// waiting for elements to be added into the DOM
resizeAndDraw();

window.addEventListener("resize", resizeAndDraw);

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyL" && e.ctrlKey) {
    toggleSidebarVisibility(sidepanel);
    e.preventDefault();
  } else if (e.code === "ArrowDown" && tree.selectedItem) {
    const itemBelow = getItemBelow(tree.root, tree.selectedItem);
    if (itemBelow) tree.selectedItem = itemBelow;
  } else if (e.code === "ArrowUp" && tree.selectedItem) {
    const itemAbove = getItemAbove(tree.selectedItem);
    if (itemAbove) tree.selectedItem = itemAbove;
  } else if (e.code === "ArrowLeft" && tree.selectedItem) {
    if (tree.selectedItem.isOpen) tree.selectedItem.isOpen = false;
    else if (tree.selectedItem.parent) {
      tree.selectedItem = tree.selectedItem.parent;
    }
  } else if (e.code === "ArrowRight" && tree.selectedItem) {
    if (!tree.selectedItem.isOpen && tree.selectedItem.children.length > 0) {
      tree.selectedItem.isOpen = true;
    } else if (tree.selectedItem.children.length > 0) {
      tree.selectedItem = tree.selectedItem.children[0];
    }
  }

  redrawCanvas();
});
