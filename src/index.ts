import { createCanvas, drawCanvas, resizeCanvas } from "./canvas";
import {
  createTree,
  getItemAbove,
  getItemBelow,
  isOneOfTheParents,
  Item,
  item,
  root,
} from "./core";
import { div } from "./html";
import { createSidepanel, toggleSidebarVisibility } from "./sidepanel";

const tree = createTree(
  root([
    item("a", [item("b", [item("b"), item("b")]), item("b", [item("b")])]),
    item("c"),
  ])
);

const tree2 = createTree(
  root([
    item("First", [
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro", [item("Electro 1")]),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
    ]),

    item("Second", [
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
    ]),
  ])
);
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
    if (tree.selectedItem.isOpen) tree.selectedItem.isOpen = false;
    else if (tree.selectedItem.parent) {
      tryChangeSelection(tree.selectedItem.parent);
    }
  } else if (e.code === "ArrowRight" && tree.selectedItem) {
    if (!tree.selectedItem.isOpen && tree.selectedItem.children.length > 0) {
      tree.selectedItem.isOpen = true;
    } else if (tree.selectedItem.children.length > 0) {
      tryChangeSelection(tree.selectedItem.children[0]);
    }
  }

  redrawCanvas();
});

document.addEventListener("wheel", (e) => {
  canvas.pageOffset = clamp(
    canvas.pageOffset + e.deltaY,
    0,
    canvas.pageHeight - canvas.canvasEl.height
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

const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};
