// Abstract operations over a tree of items

import { createItem, Item } from "./item";
export { Item } from "./item";

export type Tree = {
  root: Item;
  selectedItem: Item | undefined;
};

export const createTree = (root: Item): Tree => ({
  root,
  selectedItem: root.children[0],
});

export const root = (children: Item[]): Item => createItem("Root", children);

export const item = (
  title: string,
  children?: Item[] | Partial<Item>
): Item => {
  let item: Item;
  if (Array.isArray(children)) item = createItem(title, children || []);
  else if (children) {
    item = createItem(title, children.children || []);
    item.isOpen = !!children.isOpen;
  } else item = createItem(title, []);

  return item;
};

export const isRoot = (item: Item) => !item.parent;

const hasChildren = (item: Item) => item.children.length > 0;

export const removeChild = (parent: Item, item: Item) => {
  parent.children = parent.children.filter((c) => c !== item);
  updateIsOpenFlag(parent);
};

export const getNextItemToSelectAfterRemove = (currentlySelectedItem: Item) => {
  if (currentlySelectedItem.parent) {
    const context = currentlySelectedItem.parent.children;
    const index = context.indexOf(currentlySelectedItem);

    if (context.length == 1) return currentlySelectedItem.parent;
    else {
      if (index > 0) return context[index - 1];
      else return context[index + 1];
    }
  }
  throw new Error(
    "removing item without a parent " + currentlySelectedItem.title
  );
};

export const forEachOpenChild = (
  item: Item,
  cb: (child: Item, parent: Item) => void
) => {
  const traverse = (children: Item[]) => {
    children.forEach((c) => {
      cb(c, item);
      if (c.isOpen && hasChildren(c)) forEachOpenChild(c, cb);
    });
  };
  traverse(item.children);
};

export const forEachItem = (
  item: Item,
  cb: (child: Item, parent: Item | undefined) => void
) => {
  const traverse = (children: Item[]) => {
    children.forEach((c) => {
      cb(c, item);
      if (hasChildren(c)) forEachOpenChild(c, cb);
    });
  };
  traverse([item]);
};

export const forEachOpenChildIncludingParent = (
  item: Item,
  cb: (child: Item, parent: Item) => void
) => {
  cb(item, item.parent!);
  forEachOpenChild(item, cb);
};

export const isOneOfTheParents = (item: Item, parent: Item) => {
  let current: Item | undefined = item;
  while (current) {
    if (current === parent) return true;
    current = current.parent;
  }
  return false;
};

export const getItemBelow = (item: Item): Item | undefined =>
  item.isOpen && item.children.length > 0
    ? item.children[0]
    : getFollowingItem(item);

export const getItemAbove = (item: Item): Item | undefined => {
  const parent = item.parent;
  if (parent) {
    const index = parent.children.indexOf(item);
    if (index > 0) {
      const previousItem = parent.children[index - 1];
      if (previousItem.isOpen)
        return getLastNestedItem(
          previousItem.children[previousItem.children.length - 1]
        );
      return getLastNestedItem(previousItem);
    } else if (!isRoot(parent)) return parent;
  }
};

export const getFollowingItem = (item: Item): Item | undefined => {
  const followingItem = getFollowingSibling(item);
  if (followingItem) return followingItem;
  else {
    let parent = item.parent;
    while (parent && isLast(parent)) {
      parent = parent.parent;
    }
    if (parent) return getFollowingSibling(parent);
  }
};

const getFollowingSibling = (item: Item): Item | undefined =>
  getRelativeSibling(item, (currentIndex) => currentIndex + 1);

const getRelativeSibling = (
  item: Item,
  getNextItemIndex: (itemIndex: number) => number
): Item | undefined => {
  const context = item.parent?.children;
  if (context) {
    const index = context.indexOf(item);
    return context[getNextItemIndex(index)];
  }
};

const getLastNestedItem = (item: Item): Item => {
  if (item.isOpen && item.children) {
    const { children } = item;
    return getLastNestedItem(children[children.length - 1]);
  }
  return item;
};

const isLast = (item: Item): boolean => !getFollowingSibling(item);

export const updateIsOpenFlag = (item: Item) => {
  item.isOpen = item.children.length !== 0;
};

export const removeChildAt = (parent: Item, index: number) => {
  parent.children.splice(index, 1);
};

export const insertChildAt = (parent: Item, index: number, item: Item) => {
  parent.children.splice(index, 0, item);

  item.parent = parent;
};

export const getItemIndex = (item: Item): number => {
  if (item.parent) return item.parent.children.indexOf(item);
  else
    throw new Error(`Trying to find an item without a parent: ${item.title}`);
};
