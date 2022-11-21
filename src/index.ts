import { setOnTick } from "./frame/animations";
import { createCanvas, drawCanvas, resizeCanvas } from "./canvas";
import {
  getItemAbove,
  getItemBelow,
  isOneOfTheParents,
  Item,
} from "./tree/core";
import { div } from "./frame/html";
import { createSidepanel, toggleSidebarVisibility } from "./sidepanel";

import big from "./tree/data.big";
import { buildCanvasViews, updateCanvasViews } from "./layouter";
import { clamp } from "./tree/numbers";

const tree = big;

const canvas = createCanvas();
canvas.focusedItem = tree.root;
const redrawCanvas = () => drawCanvas(canvas, tree);

const sidepanel = createSidepanel({ onChange: redrawCanvas });

const app = div(
  "page",
  div("col", div("header"), canvas.container, div("footer")),
  sidepanel
);

const resizeAndDraw = () => {
  resizeCanvas(canvas);
  buildCanvasViews(canvas);
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
  } else if (e.code === "ArrowDown" && e.ctrlKey) {
  } else if (e.code === "ArrowRight" && tree.selectedItem && e.altKey) {
    if (canvas.focusedItem != tree.selectedItem) {
      tryChangeFocus(tree.selectedItem);
    }
    e.preventDefault();
  } else if (e.code === "ArrowLeft" && tree.selectedItem && e.altKey) {
    if (canvas.focusedItem && canvas.focusedItem.parent) {
      tryChangeFocus(canvas.focusedItem.parent);
    }
    e.preventDefault();
  } else if (e.code === "ArrowDown" && tree.selectedItem) {
    const itemBelow = getItemBelow(tree.root, tree.selectedItem);
    if (itemBelow) tryChangeSelection(itemBelow);
  } else if (e.code === "ArrowUp" && tree.selectedItem) {
    const itemAbove = getItemAbove(tree.selectedItem);
    if (itemAbove) tryChangeSelection(itemAbove);
  } else if (e.code === "ArrowLeft" && tree.selectedItem) {
    if (tree.selectedItem.isOpen) {
      tree.selectedItem.isOpen = false;
    } else if (tree.selectedItem.parent) {
      tryChangeSelection(tree.selectedItem.parent);
    }
  } else if (e.code === "ArrowRight" && tree.selectedItem) {
    if (!tree.selectedItem.isOpen && tree.selectedItem.children.length > 0) {
      tree.selectedItem.isOpen = true;
    } else if (tree.selectedItem.children.length > 0) {
      tryChangeSelection(tree.selectedItem.children[0]);
    }
  }
  updateCanvasViews(canvas);
  redrawCanvas();
});

document.addEventListener("wheel", (e) => {
  canvas.pageOffset = clamp(
    canvas.pageOffset + e.deltaY,
    0,
    canvas.pageHeight - canvas.height
  );
  redrawCanvas();
});

const tryChangeSelection = (newItemToSelect: Item) => {
  if (
    canvas.focusedItem &&
    isOneOfTheParents(newItemToSelect, canvas.focusedItem)
  )
    tree.selectedItem = newItemToSelect;
};

const tryChangeFocus = (newItemToFocus: Item) => {
  canvas.focusedItem = newItemToFocus;
};

setOnTick(redrawCanvas);
