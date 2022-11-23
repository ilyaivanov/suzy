import { MyCanvas } from "../canvas";
import { to } from "../framework/animations";
import {
  forEachChildIncludingParent,
  getNextItemToSelectAfterRemove,
  Item,
  removeChild,
  Tree,
  updateIsOpenFlag,
} from "../tree/core";

export type Remove = {
  type: "remove";
  item: Item;
  oldIndex: number;
  itemToSelect: Item;
};

export const doRemove = (tree: Tree, canvas: MyCanvas, action: Remove) => {
  forEachChildIncludingParent(action.item, (child) => {
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

  removeChild(action.item.parent!, action.item);
  tree.selectedItem = action.itemToSelect;
};

export const undoRemove = (tree: Tree, canvas: MyCanvas, action: Remove) => {
  action.item.parent!.children.splice(action.oldIndex, 0, action.item);
  tree.selectedItem = action.item;
  updateIsOpenFlag(action.item.parent!);
};

export const createRemoveAction = (tree: Tree): Remove => ({
  type: "remove",
  item: tree.selectedItem!,
  oldIndex: tree.selectedItem?.parent?.children.indexOf(tree.selectedItem)!,
  itemToSelect: getNextItemToSelectAfterRemove(tree.selectedItem!),
});
