import { createCanvas, MyCanvas } from "./canvas";
import { forEachItem, Item, Tree } from "./tree/core";
import big from "./tree/data.big";

type SerializedState = {
  root: Item;
  focusedItemId: number;
  selectedItemId: number;
};

export const serialize = (tree: Tree, canvas: MyCanvas): string => {
  return serializeState({
    root: tree.root,
    focusedItemId: canvas.focusedItem?.id || 0,
    selectedItemId: tree.selectedItem?.id || 0,
  });
};

export const deserialize = (
  str: string | undefined
): { tree: Tree; focused: Item } => {
  if (!str)
    return {
      tree: big,
      focused: big.root,
    };
  else {
    const state = parse(str);

    let focused: Item = state.root;
    let selectedItem: Item = state.root.children[0];
    forEachItem(state.root, (item) => {
      if (item.id == state.focusedItemId) focused = item;

      if (item.id == state.selectedItemId) selectedItem = item;
    });
    return {
      focused,
      tree: { root: state.root, selectedItem },
    };
  }
};

const parse = (serializedTree: string): SerializedState => {
  const state: any = JSON.parse(serializedTree);

  const assignParents = (item: Item): Item => {
    item.children = item.children.map((c) => {
      const subItem = assignParents(c);
      subItem.parent = item;
      return subItem;
    });

    return item;
  };

  if (state.root) {
    assignParents(state.root);
    return state;
  } else {
    // legacy file format containing only root in json file
    const root: Item = state;
    assignParents(root);
    return {
      root,
      selectedItemId: root.children[0].id,
      focusedItemId: root.id,
    };
  }
};

const serializeState = (tree: SerializedState): string => {
  function replacer(key: keyof Item, value: unknown) {
    if (key == "parent") return undefined;
    else return value;
  }
  return JSON.stringify(tree, replacer as any);
};
