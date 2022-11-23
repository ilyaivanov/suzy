import { inputText } from "./framework/html";

import constants from "./constants";
import { doAction } from "./undoHistory";
import { createRenameAction } from "./editing/rename";
import { MyCanvas } from "./canvas";
import { Tree } from "./tree/core";

let input: HTMLInputElement | undefined;

// Creating a new item skips rename event, making one undoable action 'Create'
// While renaming an item there is a separate undoable rename event
// This flag disntinguish between these
let isNearlyCreated = false;

export const isCurrentlyEditing = () => !!input;

export const showInputForCreatedItem = (
  canvas: MyCanvas,
  tree: Tree,
  onFinishEdit: () => void
) => {
  isNearlyCreated = true;
  showInput(canvas, tree, onFinishEdit);
};

export const showInputForExistingItem = (
  canvas: MyCanvas,
  tree: Tree,
  onFinishEdit: () => void
) => {
  isNearlyCreated = false;
  showInput(canvas, tree, onFinishEdit);
};

const showInput = (canvas: MyCanvas, tree: Tree, onFinishEdit: () => void) => {
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
      updateInputCoordinates(canvas, tree);
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
          onFinishEdit();
          e.stopPropagation();
        }
      });
      input.focus();
      input.scrollTo({ left: 0 });
      input.setSelectionRange(0, 0);
    }
  }
};

export const updateInputCoordinates = (canvas: MyCanvas, tree: Tree) => {
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
