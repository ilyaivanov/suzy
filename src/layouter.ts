import { fromTo, spring, Spring, to } from "./framework/animations";
import constants from "./constants";
import { isRoot, Item } from "./tree/core";
import type { MyCanvas } from "./canvas";
import { View } from "./view";

const buildViewFromLayoutItem = (
  layouted: LayoutedItem,
  canvas: MyCanvas
): View => {
  const isFocused = canvas.focusedItem == layouted.item;
  return {
    x: spring(layouted.x),
    y: spring(layouted.y),
    opacity: spring(1),
    item: layouted.item,
    fontSize: isFocused ? constants.focusedFontSize : constants.fontSize,
    rowHeight: isFocused ? constants.focusedRowHeight : constants.rowHeight,
    fontWeight: isFocused ? 600 : 400,
    childrenHeight: layouted.childrenHeight,
    isDisappearing: false,
  };
};

export const buildCanvasViews = (canvas: MyCanvas) => {
  let pageHeight = 0;

  traverseOpenItems(canvas.width, canvas.focusedItem!, (view) => {
    canvas.views.set(view.item, buildViewFromLayoutItem(view, canvas));

    pageHeight = Math.max(view.y + view.rowHeight, pageHeight);
  });

  canvas.pageHeight = pageHeight + constants.bottomPageMargin;
};

export const updateCanvasViews = (canvas: MyCanvas) => {
  let pageHeight = 0;
  const viewToRemove = new Set(canvas.views.keys());
  traverseOpenItems(canvas.width, canvas.focusedItem!, (view) => {
    const existingView = canvas.views.get(view.item);
    // I don't like the fact that view has already springs inside, which we don't use at all
    if (existingView) {
      viewToRemove.delete(existingView.item);

      if (existingView.isDisappearing) {
        // Enter animation while it is disappearing
        to(existingView.opacity, 1);
        existingView.opacity.onFinish = undefined;
        existingView.isDisappearing = false;
      }
      // Move animation
      if (existingView.x.targetValue !== view.x) to(existingView.x, view.x);

      if (existingView.y.targetValue !== view.y) to(existingView.y, view.y);

      existingView.childrenHeight = view.childrenHeight;

      const isFocused = canvas.focusedItem == view.item;
      existingView.fontSize = isFocused
        ? constants.focusedFontSize
        : constants.fontSize;
      existingView.fontWeight = isFocused ? 600 : 400;
      existingView.rowHeight = view.rowHeight;
    } else {
      // Enter animation
      const newview = buildViewFromLayoutItem(view, canvas);
      canvas.views.set(view.item, newview);
      fromTo(newview.opacity, 0, 1);
    }

    pageHeight = Math.max(view.y + view.rowHeight, pageHeight);
  });

  viewToRemove.forEach((key) => {
    // exit animation WARNING: needs coordination with enter
    const view = canvas.views.get(key);
    if (view) {
      to(view.opacity, 0);
      view.isDisappearing = true;
      view.opacity.onFinish = () => canvas.views.delete(key);
    }
  });
  canvas.pageHeight = pageHeight + constants.bottomPageMargin;
};
type LayoutedItem = {
  x: number;
  y: number;
  item: Item;
  rowHeight: number;
  childrenHeight: number | undefined;
};
const traverseOpenItems = (
  canvasWidth: number,
  focused: Item,
  cb: (view: LayoutedItem) => void
) => {
  let rowTop = 0;
  let x =
    Math.max((canvasWidth - constants.maxWidth) / 2, 0) +
    constants.leftRightCanvasPadding;

  const onItem = (item: Item, level: number): number => {
    const isFocused = item == focused;
    const rowHeight = isFocused
      ? constants.focusedRowHeight
      : constants.rowHeight;

    const layoutedItem: LayoutedItem = {
      x: roundToHalf(x + level * constants.xStep),
      y: rowTop,
      item: item,
      rowHeight,
      childrenHeight: undefined,
    };
    rowTop += rowHeight;

    let childrenHeight = 0;
    if (item.isOpen) {
      childrenHeight = item.children.reduce(
        (acc, sub) => acc + onItem(sub, level + 1),
        0
      );
      if (!isFocused) layoutedItem.childrenHeight = childrenHeight;
    }

    cb(layoutedItem);

    return childrenHeight + rowHeight;
  };

  const startingNodes = isRoot(focused) ? focused.children : [focused];
  startingNodes.forEach((child) => onItem(child, 0));
};

const roundToHalf = (val: number) => Math.floor(val) + 0.5;
