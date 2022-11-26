import { setOnTick, to } from "./framework/animations";
import { changeFocus, createCanvas, drawCanvas, resizeCanvas } from "./canvas";

import { div } from "./framework/html";
import { createSidepanel, toggleSidebarVisibility } from "./sidepanel";

import { buildCanvasViews, updateCanvasViews } from "./layouter";
import { clamp } from "./tree/numbers";
import { redoAction, doAction, undoAction } from "./undoHistory";
import { createRemoveAction } from "./editing/remove";
import { createMoveAction } from "./editing/move";
import { createCreateAction } from "./editing/create";

import {
  closeCurrentOrSelectParent,
  openCurrentOrSelectChild,
  selectItemAbove,
  selectItemBelow,
  selectNextSibling,
  selectPreviousSibling,
} from "./navigation/selection";

import {
  isCurrentlyEditing,
  showInputForCreatedItem,
  showInputForExistingItem,
  updateInputCoordinates,
} from "./itemTextInput";
import {
  loadFromFile,
  loadFromLocalStorage,
  saveToFile,
  saveToLocalStorage,
} from "./persistance";
import { deserialize, serialize } from "./persistance.save";

const initialState = deserialize(loadFromLocalStorage());
let tree = initialState.tree;

let canvas = createCanvas();
canvas.focusedItem = initialState.focused;

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
  if (isCurrentlyEditing() || !canvas.focusedItem || !tree.selectedItem) {
    return;
  }

  //
  // Movement
  //
  if (e.code === "ArrowDown" && e.metaKey)
    doAction(tree, canvas, createMoveAction(tree, "down", canvas.focusedItem));
  else if (e.code === "ArrowUp" && e.metaKey)
    doAction(tree, canvas, createMoveAction(tree, "up", canvas.focusedItem));
  else if (e.code === "ArrowRight" && e.metaKey) {
    e.preventDefault();
    doAction(tree, canvas, createMoveAction(tree, "right", canvas.focusedItem));
  } else if (e.code === "ArrowLeft" && e.metaKey) {
    e.preventDefault();
    doAction(tree, canvas, createMoveAction(tree, "left", canvas.focusedItem));
  }

  //
  // Undo/Redo
  //
  else if (e.code === "KeyZ" && e.metaKey && e.shiftKey) {
    redoAction(tree, canvas);
  } else if (e.code === "KeyZ" && e.metaKey) {
    undoAction(tree, canvas);
  }

  //
  // Persistance
  //
  else if (e.code === "KeyS" && e.metaKey) {
    e.preventDefault();
    saveToFile(serialize(tree, canvas));
  } else if (e.code === "KeyL" && e.metaKey) {
    e.preventDefault();
    loadFromFile().then((str) => {
      const state = deserialize(str);

      tree = state.tree;
      canvas.focusedItem = state.focused;
      canvas.views.clear();
      resizeAndDraw();
    });
    return;
  }
  //
  // Navigation
  //
  else if (e.code === "ArrowRight" && e.altKey) {
    if (canvas.focusedItem != tree.selectedItem) {
      changeFocus(canvas, tree.selectedItem, tree);
    }
    e.preventDefault();
  } else if (e.code === "ArrowLeft" && e.altKey) {
    if (canvas.focusedItem && canvas.focusedItem.parent) {
      changeFocus(canvas, canvas.focusedItem.parent, tree);
    }
    e.preventDefault();
  } else if (e.code === "ArrowDown" && e.altKey)
    selectNextSibling(canvas, tree);
  else if (e.code === "ArrowUp" && e.altKey)
    selectPreviousSibling(canvas, tree);
  else if (e.code === "ArrowDown") selectItemBelow(canvas, tree);
  else if (e.code === "ArrowUp") selectItemAbove(canvas, tree);
  else if (e.code === "ArrowLeft") closeCurrentOrSelectParent(canvas, tree);
  else if (e.code === "ArrowRight") openCurrentOrSelectChild(canvas, tree);
  //
  //
  //
  else if (e.code === "KeyE") {
    canvas.editedItem = tree.selectedItem;
    showInputForExistingItem(canvas, tree, redrawCanvas);
    e.preventDefault();
  } else if (e.code === "Enter") {
    const action = createCreateAction(
      tree,
      tree.selectedItem.isOpen ? "inside" : "after"
    );
    doAction(tree, canvas, action);
    if (action) {
      tree.selectedItem = action.item;
      canvas.editedItem = action.item;
    }

    //need to wait while updateCanvasViews will build the view
    requestAnimationFrame(() =>
      showInputForCreatedItem(canvas, tree, redrawCanvas)
    );
  } else if (e.code === "KeyX") {
    doAction(tree, canvas, createRemoveAction(tree));
  } else if (e.code === "KeyL" && e.ctrlKey) {
    toggleSidebarVisibility(sidepanel);
    e.preventDefault();
  }

  saveToLocalStorage(serialize(tree, canvas));
  updateCanvasViews(canvas);
  redrawCanvas();
});

document.addEventListener("wheel", (e) => {
  if (canvas.pageHeight > canvas.height) {
    const targetOffset = clamp(
      canvas.pageOffset.targetValue + e.deltaY,
      0,
      canvas.pageHeight - canvas.height
    );

    to(canvas.pageOffset, targetOffset);
    redrawCanvas();
  }
});

canvas.pageOffset.onTick = () => updateInputCoordinates(canvas, tree);

setOnTick(redrawCanvas);
