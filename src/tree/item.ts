export type Item = {
  id: number;
  title: string;
  children: Item[];
  isOpen: boolean;
  parent?: Item;
};

export const createItem = (title: string, children: Item[]): Item =>
  setParentForChildren(
    {
      id: Math.random(),
      title,
      children,
      isOpen: children.length > 0,
    },
    children
  );

const setParentForChildren = (item: Item, children: Item[]): Item => {
  children.forEach((c) => (c.parent = item));
  return item;
};
