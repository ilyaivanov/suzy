import { setOnTick, to } from "./framework/animations";
import { changeFocus, createCanvas, drawCanvas, resizeCanvas } from "./canvas";

import { div, inputText } from "./framework/html";
import { createSidepanel, toggleSidebarVisibility } from "./sidepanel";

import { buildCanvasViews, updateCanvasViews } from "./layouter";
import { clamp } from "./tree/numbers";
import constants from "./constants";
import { redoAction, doAction, undoAction } from "./undoHistory";
import { createRemoveAction } from "./editing/remove";
import { createRenameAction } from "./editing/rename";
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

//USED SOLELY for development
import big from "./tree/data.big";
const tree = big;

const canvas = createCanvas();

//@ts-expect-error
window.tree = tree;

//@ts-expect-error
window.canvas = canvas;

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
  if (input || !canvas.focusedItem || !tree.selectedItem) {
    return input;
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
  // Navigation
  //
  else if (e.code === "ArrowRight" && e.altKey) {
    if (canvas.focusedItem != tree.selectedItem) {
      changeFocus(canvas, tree.selectedItem);
    }
    e.preventDefault();
  } else if (e.code === "ArrowLeft" && e.altKey) {
    if (canvas.focusedItem && canvas.focusedItem.parent) {
      changeFocus(canvas, canvas.focusedItem.parent);
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
    showInput();
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

    isNearlyCreated = true;
    //need to wait while updateCanvasViews will build the view
    requestAnimationFrame(showInput);
  } else if (e.code === "KeyX") {
    doAction(tree, canvas, createRemoveAction(tree));
  } else if (e.code === "KeyL" && e.ctrlKey) {
    toggleSidebarVisibility(sidepanel);
    e.preventDefault();
  }

  updateCanvasViews(canvas);
  redrawCanvas();
});

document.addEventListener("wheel", (e) => {
  if (canvas.pageHeight > canvas.height) {
    console.log(canvas.pageOffset.targetValue, e.deltaY);
    const targetOffset = clamp(
      canvas.pageOffset.targetValue + e.deltaY,
      0,
      canvas.pageHeight - canvas.height
    );

    to(canvas.pageOffset, targetOffset);
    updateInputCoordinates();
    redrawCanvas();
  }
});

let input: HTMLInputElement | undefined;

// Creating a new item skips rename event, making one undoable action 'Create'
// While renaming an item there is a separate undoable rename event
// This flag disntinguish between these
let isNearlyCreated = false;

function showInput() {
  input = inputText({ value: "", onChange: () => {} });

  input.style.position = "fixed";

  input.style.fontFamily = constants.font;

  if (tree.selectedItem) {
    const view = canvas.views.get(tree.selectedItem!);

    if (view) {
      input.style.fontWeight = view.fontWeight + "";
      input.style.fontSize = view.fontSize + "px";

      const left =
        view!.x.currentValue +
        constants.squareSize +
        constants.textLeftMargin +
        canvas.x;
      input.style.left = left + "px";
      input.style.width = canvas.width - left + "px";
      updateInputCoordinates();
      input.style.height = view.rowHeight + "px";
      input.style.color = "white";

      input.value = tree.selectedItem.title;

      document.body.appendChild(input);

      input.classList.add("item-text-input");

      input.addEventListener("keydown", (e) => {
        if (
          (e.code === "Escape" ||
            e.code === "Enter" ||
            e.code === "NumpadEnter") &&
          input &&
          canvas.editedItem
        ) {
          if (isNearlyCreated) {
            canvas.editedItem.title = input.value;
            isNearlyCreated = false;
          } else
            doAction(
              tree,
              canvas,
              createRenameAction(canvas.editedItem, input.value)
            );

          input.remove();
          input = undefined;
          canvas.editedItem = undefined;
          redrawCanvas();
          e.stopPropagation();
        }
      });
      input.focus();
      input.scrollTo({ left: 0 });
      input.setSelectionRange(0, 0);
    }
  }
}

const updateInputCoordinates = () => {
  if (input && tree.selectedItem) {
    const view = canvas.views.get(tree.selectedItem!);
    if (view) {
      // Warning: minus one pixel is done by hand, need to investigate
      // works now for small and big font, but changing fontSizes too much might break this
      const diff = 1.5;
      input.style.top = `${
        view.y.currentValue + canvas.y - diff - canvas.pageOffset.currentValue
      }px`;
    }
  }
};

setOnTick(redrawCanvas);
