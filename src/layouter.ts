import constants from "./constants";
import { isRoot, Item } from "./core";

export type View = {
  x: number;
  y: number;
  fontSize: number;
  fontWeight: number;
  rowHeight: number;

  lineHeight: number | undefined;
  item: Item;
};

export const buildViews = (
  canvasWidth: number,
  focused: Item,
  cb: (view: View) => void
) => {
  let rowTop = 0;
  let x =
    Math.max((canvasWidth - constants.maxWidth) / 2, 0) +
    constants.leftRightCanvasPadding;

  if (!isRoot(focused)) {
    cb({
      x,
      y: rowTop,
      item: focused,
      fontSize: constants.focusedFontSize,
      rowHeight: constants.focusedRowHeight,
      fontWeight: 500,
      lineHeight: undefined,
    });
    rowTop += constants.focusedRowHeight;
  }

  const onItem = (item: Item, level: number): number => {
    const view: View = {
      x: x + level * constants.xStep,
      y: rowTop,
      item: item,
      rowHeight: constants.rowHeight,
      fontSize: constants.fontSize,
      fontWeight: 400,
      lineHeight: item.isOpen ? 40 : undefined,
    };
    rowTop += constants.rowHeight;

    let childrenHeight = 0;
    if (item.isOpen) {
      childrenHeight = item.children.reduce(
        (acc, sub) => acc + onItem(sub, level + 1),
        0
      );
      view.lineHeight = childrenHeight;
    }

    cb(view);

    return childrenHeight + constants.rowHeight;
  };

  focused.children.forEach((child) => onItem(child, isRoot(focused) ? 0 : 1));
};
