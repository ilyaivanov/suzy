import { centerOnItem, MyCanvas } from "../canvas";
import {
  getItemAbove,
  getItemBelow,
  getItemIndex,
  isOneOfTheParents,
  isRoot,
  Item,
  Tree,
} from "../tree/core";

export const selectItemBelow = (canvas: MyCanvas, tree: Tree) => {
  if (tree.selectedItem) {
    const itemBelow = getItemBelow(tree.selectedItem);
    if (itemBelow) tryChangeSelection(tree, canvas, itemBelow);
  }
};
export const selectItemAbove = (canvas: MyCanvas, tree: Tree) => {
  if (tree.selectedItem) {
    const itemAbove = getItemAbove(tree.selectedItem);
    if (itemAbove) tryChangeSelection(tree, canvas, itemAbove);
  }
};
export const selectNextSibling = (canvas: MyCanvas, tree: Tree) => {
  if (tree.selectedItem) {
    const index = getItemIndex(tree.selectedItem);
    if (index < tree.selectedItem.parent!.children.length - 1) {
      tryChangeSelection(
        tree,
        canvas,
        tree.selectedItem.parent!.children[index + 1]
      );
    } else selectItemBelow(canvas, tree);
  }
};
export const selectPreviousSibling = (canvas: MyCanvas, tree: Tree) => {
  if (tree.selectedItem) {
    const index = getItemIndex(tree.selectedItem);
    if (index > 0) {
      tryChangeSelection(
        tree,
        canvas,
        tree.selectedItem.parent!.children[index - 1]
      );
    } else selectItemAbove(canvas, tree);
  }
};

export const closeCurrentOrSelectParent = (canvas: MyCanvas, tree: Tree) => {
  if (tree.selectedItem) {
    if (tree.selectedItem.isOpen) {
      tree.selectedItem.isOpen = false;
    } else if (tree.selectedItem.parent) {
      tryChangeSelection(tree, canvas, tree.selectedItem.parent);
    }
  }
};

export const openCurrentOrSelectChild = (canvas: MyCanvas, tree: Tree) => {
  if (tree.selectedItem) {
    if (!tree.selectedItem.isOpen && tree.selectedItem.children.length > 0) {
      tree.selectedItem.isOpen = true;
    } else if (tree.selectedItem.children.length > 0) {
      tryChangeSelection(tree, canvas, tree.selectedItem.children[0]);
    }
  }
};

export const tryChangeSelection = (
  tree: Tree,
  canvas: MyCanvas,
  newItemToSelect: Item
) => {
  if (
    canvas.focusedItem &&
    isOneOfTheParents(newItemToSelect, canvas.focusedItem) &&
    !isRoot(newItemToSelect)
  ) {
    tree.selectedItem = newItemToSelect;
    centerOnItem(canvas, newItemToSelect);
  }
};
