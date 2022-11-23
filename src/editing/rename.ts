import { Item } from "../tree/core";

export type Rename = {
  type: "rename";
  item: Item;
  oldName: string;
  newName: string;
};

export const doRename = (action: Rename) => {
  action.item.title = action.newName;
};

export const undoRename = (action: Rename) => {
  action.item.title = action.oldName;
};

export const createRenameAction = (item: Item, newName: string): Rename => ({
  type: "rename",
  item,
  newName,
  oldName: item.title,
});
