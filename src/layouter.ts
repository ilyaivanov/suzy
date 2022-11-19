import constants from "./constants";
import { isRoot, Item } from "./core";

export type View = {
  x: number;
  y: number;
  fontSize: number;
  fontWeight: number;
  rowHeight: number;
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
    });
    rowTop += constants.focusedRowHeight;
  }

  const onItem = (item: Item, level: number) => {
    cb({
      x: x + level * constants.xStep,
      y: rowTop,
      item: item,
      rowHeight: constants.rowHeight,
      fontSize: constants.fontSize,
      fontWeight: 400,
    });
    rowTop += constants.rowHeight;

    if (item.isOpen) item.children.forEach((sub) => onItem(sub, level + 1));
  };

  focused.children.forEach((child) => onItem(child, isRoot(focused) ? 0 : 1));
};
