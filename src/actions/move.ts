import { Item, Tree, updateIsOpenFlag } from "../tree/core";

export type Move = {
  type: "move";
  item: Item;
  originalParent: Item;
  originalIndex: number;
  targetParent: Item;
  targetIndex: number;
};

export const doMove = (action: Move) => {
  removeChildAt(action.originalParent, action.originalIndex);
  insertChildAt(action.targetParent, action.targetIndex, action.item);

  updateIsOpenFlag(action.originalParent);
  updateIsOpenFlag(action.targetParent);
};

export const undoMove = (action: Move) => {
  removeChildAt(action.targetParent, action.targetIndex);
  insertChildAt(action.originalParent, action.originalIndex, action.item);

  updateIsOpenFlag(action.originalParent);
  updateIsOpenFlag(action.targetParent);
};

type Direction = "up" | "down" | "left" | "right";

export const createMoveAction = (
  tree: Tree,
  direction: Direction
): Move | undefined => {
  const { selectedItem } = tree;

  if (selectedItem && selectedItem.parent) {
    const context = selectedItem.parent.children;
    const index = context.indexOf(selectedItem);

    if (direction === "down" && index < context.length - 1) {
      return {
        type: "move",
        item: selectedItem,
        originalParent: selectedItem.parent,
        originalIndex: index,
        targetParent: selectedItem.parent,
        targetIndex: index + 1,
      };
    } else if (direction === "up" && index > 0) {
      return {
        type: "move",
        item: selectedItem,
        originalParent: selectedItem.parent,
        originalIndex: index,
        targetParent: selectedItem.parent,
        targetIndex: index - 1,
      };
    } else if (direction === "right" && index > 0) {
      const previousItem = context[index - 1];
      return {
        type: "move",
        item: selectedItem,
        originalParent: selectedItem.parent,
        originalIndex: index,
        targetParent: previousItem,
        targetIndex: previousItem.children.length,
      };
    }
  }
};

const removeChildAt = (parent: Item, index: number) => {
  parent.children.splice(index, 1);
};

const insertChildAt = (parent: Item, index: number, item: Item) => {
  parent.children.splice(index, 0, item);

  item.parent = parent;
};
