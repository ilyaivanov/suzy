import { Item, Tree } from "../tree/core";
import { insertChildAt, removeChildAt } from "../tree/core";

export type Create = {
  type: "create";
  item: Item;
  at: number;
  selectedItem: Item;
};

export const doCreate = (action: Create) => {
  if (action.item.parent)
    insertChildAt(action.item.parent, action.at, action.item);
};

export const undoCreate = (tree: Tree, action: Create) => {
  if (action.item.parent) {
    removeChildAt(action.item.parent, action.at);
    tree.selectedItem = action.selectedItem;
  }
};

type Position = "after" | "inside";
// stupid name, but this method creates 'Create' action
export const createCreateAction = (
  tree: Tree,
  position: Position
): Create | undefined => {
  const newItem: Item = { title: "", children: [], isOpen: false };

  if (!tree.selectedItem) return;

  if (position == "after" && tree.selectedItem.parent) {
    const parentContext = tree.selectedItem.parent!.children;
    const index = parentContext.indexOf(tree.selectedItem) + 1;
    newItem.parent = tree.selectedItem.parent;
    return {
      type: "create",
      item: newItem,
      at: index,
      selectedItem: tree.selectedItem,
    };
  } else if (position === "inside") {
    newItem.parent = tree.selectedItem;
    return {
      type: "create",
      item: newItem,
      at: 0,
      selectedItem: tree.selectedItem,
    };
  }
};
