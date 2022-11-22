import { MyCanvas } from "./canvas";
import { to } from "./framework/animations";
import {
  forEachChildIncludingParent,
  getNextItemToSelectAfterRemove,
  Item,
  removeChild,
  Tree,
  updateIsOpenFlag,
} from "./tree/core";

export type Action = Rename | Remove;

type Rename = {
  type: "rename";
  item: Item;
  oldName: string;
  newName: string;
};

type Remove = {
  type: "remove";
  item: Item;
  oldIndex: number;
};

export const removeItem = (tree: Tree, canvas: MyCanvas) => {
  forEachChildIncludingParent(tree.selectedItem!, (child) => {
    const view = canvas.views.get(child);
    if (view) {
      to(view.x, view.x.targetValue - 20);
      to(view.opacity, 0);
      // this can be undone via undo
      view.opacity.onFinish = () => {
        canvas.views.delete(view.item);
      };
    }
  });
  //selecting parent item for now for simplicity
  const itemToSelect = getNextItemToSelectAfterRemove(tree.selectedItem!);

  addActionToHistory({
    type: "remove",
    item: tree.selectedItem!,
    oldIndex: tree.selectedItem?.parent?.children.indexOf(tree.selectedItem)!,
  });
  removeChild(tree.selectedItem!.parent!, tree.selectedItem!);
  tree.selectedItem = itemToSelect;
};

export const undoAction = (tree: Tree, canvas: MyCanvas) => {
  if (currentIndex != -1) {
    const lastAction = history[currentIndex];
    currentIndex -= 1;
    if (lastAction.type == "remove") {
      lastAction.item.parent!.children.splice(
        lastAction.oldIndex,
        0,
        lastAction.item
      );
      tree.selectedItem = lastAction.item;
      updateIsOpenFlag(lastAction.item.parent!);
    }
  }
};

export const redoAction = () => {};

let currentIndex = -1;
const history: Action[] = [];
const addActionToHistory = (action: Action) => {
  console.log(action);
  // TODO: remove all items after current index
  history.push(action);
  currentIndex += 1;
};

const revertAction = (action: Action) => {};
