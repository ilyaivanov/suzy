import { setOnTick } from "./framework/animations";
import { createCanvas, drawCanvas, resizeCanvas } from "./canvas";
import {
  getItemAbove,
  getItemBelow,
  isOneOfTheParents,
  Item,
} from "./tree/core";
import { div, inputCheckbox, inputText } from "./framework/html";
import { createSidepanel, toggleSidebarVisibility } from "./sidepanel";

import big from "./tree/data.big";
import {
  buildCanvasViews,
  getTextCoordinates,
  updateCanvasViews,
} from "./layouter";
import { clamp } from "./tree/numbers";
import constants from "./constants";

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

let a: any = true;
document.addEventListener("keydown", (e) => {
  if (input) {
    return;
  }
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
  } else if (e.code === "KeyE" && tree.selectedItem) {
    canvas.editedItem = tree.selectedItem;
    showInput();
    e.preventDefault();
  }
  updateCanvasViews(canvas);
  redrawCanvas();
});

document.addEventListener("wheel", (e) => {
  if (canvas.pageHeight > canvas.height) {
    canvas.pageOffset = clamp(
      canvas.pageOffset + e.deltaY,
      0,
      canvas.pageHeight - canvas.height
    );
    updateInputCoordinates();
    redrawCanvas();
  }
});

let input: HTMLInputElement | undefined;

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
          canvas.editedItem.title = input.value;
          input.remove();
          input = undefined;
          canvas.editedItem = undefined;
          redrawCanvas();
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
        view.y.currentValue + canvas.y - diff - canvas.pageOffset
      }px`;
    }
  }
};

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
