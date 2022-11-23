import {
  isOneOfTheParents,
  isRoot,
  Item,
  Tree,
  updateIsOpenFlag,
} from "../tree/core";

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
  direction: Direction,
  focusedItem: Item
): Move | undefined => {
  const { selectedItem } = tree;

  const selectedItemParent = selectedItem?.parent;
  if (selectedItem && selectedItemParent) {
    const context = selectedItemParent.children;
    const index = context.indexOf(selectedItem);

    const createMoveActionForSelected = (
      targetParent: Item,
      targetIndex: number
    ): Move | undefined =>
      isOneOfTheParents(targetParent, focusedItem)
        ? {
            type: "move",
            item: selectedItem,
            originalParent: selectedItemParent,
            originalIndex: index,
            targetParent,
            targetIndex,
          }
        : undefined;

    if (direction === "down" && index < context.length - 1) {
      return createMoveActionForSelected(selectedItemParent, index + 1);
    } else if (
      direction === "down" &&
      index == context.length - 1 &&
      !isRoot(selectedItemParent)
    ) {
      const parentIndex = getItemIndex(selectedItemParent);
      const parentParentContext = selectedItemParent.parent?.children;
      if (parentParentContext && parentIndex < parentParentContext.length - 1) {
        return createMoveActionForSelected(
          parentParentContext[parentIndex + 1],
          0
        );
      }
    } else if (direction === "up" && index > 0) {
      return createMoveActionForSelected(selectedItemParent, index - 1);
    } else if (
      direction === "up" &&
      index == 0 &&
      !isRoot(selectedItemParent)
    ) {
      const parentIndex = getItemIndex(selectedItemParent);
      const parentParentContext = selectedItemParent.parent?.children;
      if (parentParentContext && parentIndex > 0) {
        return createMoveActionForSelected(
          parentParentContext[parentIndex - 1],
          parentParentContext.length
        );
      }
    } else if (direction === "right" && index > 0) {
      const previousItem = context[index - 1];
      const lastPosition = previousItem.children.length;
      return createMoveActionForSelected(previousItem, lastPosition);
    } else if (direction === "left" && selectedItemParent.parent) {
      const targetIndex = getItemIndex(selectedItemParent) + 1;
      return createMoveActionForSelected(
        selectedItemParent.parent,
        targetIndex
      );
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

const getItemIndex = (item: Item): number => {
  if (item.parent) return item.parent.children.indexOf(item);
  else
    throw new Error(`Trying to find an item without a parent: ${item.title}`);
};
