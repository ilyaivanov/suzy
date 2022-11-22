import { fromTo, spring, Spring, to } from "./framework/animations";
import constants from "./constants";
import { isRoot, Item } from "./tree/core";
import type { MyCanvas } from "./canvas";

export type View = {
  x: Spring;
  y: Spring;
  fontSize: number;
  fontWeight: number;
  rowHeight: number;

  childrenHeight: number | undefined;
  item: Item;

  isDisappearing: boolean;
  opacity: Spring;
};

export const buildCanvasViews = (canvas: MyCanvas) => {
  let pageHeight = 0;

  traverseOpenItems(canvas.width, canvas.focusedItem!, (view) => {
    canvas.views.set(view.item, view);
    if (view.y.currentValue + view.rowHeight > pageHeight)
      pageHeight = view.y.currentValue + view.rowHeight;

    // exit animation
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
      to(existingView.y, view.y.currentValue);
      to(existingView.x, view.x.currentValue);
      existingView.childrenHeight = view.childrenHeight;

      existingView.fontSize = view.fontSize;
      existingView.fontWeight = view.fontWeight;
      existingView.rowHeight = view.rowHeight;
    } else {
      // Enter animation
      canvas.views.set(view.item, view);
      fromTo(view.opacity, 0, 1);
    }
    if (view.y.currentValue + view.rowHeight > pageHeight)
      pageHeight = view.y.currentValue + view.rowHeight;
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

const traverseOpenItems = (
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
      x: spring(x),
      y: spring(rowTop),
      opacity: spring(1),
      item: focused,
      fontSize: constants.focusedFontSize,
      rowHeight: constants.focusedRowHeight,
      fontWeight: 600,
      childrenHeight: undefined,
      isDisappearing: false,
    });
    rowTop += constants.focusedRowHeight;
  }

  const onItem = (item: Item, level: number): number => {
    const view: View = {
      x: spring(roundToHalf(x + level * constants.xStep)),
      y: spring(rowTop),
      opacity: spring(1),
      item: item,
      rowHeight: constants.rowHeight,
      fontSize: constants.fontSize,
      fontWeight: 400,
      childrenHeight: undefined,
      isDisappearing: false,
    };
    rowTop += constants.rowHeight;

    let childrenHeight = 0;
    if (item.isOpen) {
      childrenHeight = item.children.reduce(
        (acc, sub) => acc + onItem(sub, level + 1),
        0
      );
      view.childrenHeight = childrenHeight;
    }

    cb(view);

    return childrenHeight + constants.rowHeight;
  };

  focused.children.forEach((child) => onItem(child, isRoot(focused) ? 0 : 1));
};

export const drawView = (
  { ctx, editedItem }: MyCanvas,
  view: View,
  focusedItem: Item,
  selectedItem: Item
) => {
  const squareY = view.y.currentValue + view.rowHeight / 2;
  ctx.globalAlpha = view.opacity.currentValue;
  if (view.item !== focusedItem)
    drawRectAtCenter(
      ctx,
      // need to extract rounding into separate function to make pixel perfect rectangles
      view.x.currentValue + constants.squareSize / 2,
      squareY,
      constants.squareSize,
      "#FFFFFF",
      view.item.children.length > 0
    );

  if (view.item !== editedItem) {
    ctx.fillStyle = "white";
    ctx.font = `${view.fontWeight} ${view.fontSize}px ${constants.font}`;
    ctx.textBaseline = "middle";
    const { x, y } = getTextCoordinates(view);
    ctx.fillText(view.item.title, x, y);
  }
  if (view.item == selectedItem) {
    drawFullWidthBar(
      ctx,
      view.y.currentValue,
      view.rowHeight,
      `rgba(255,255,255,${constants.selectedBarAlpha})`
    );
  }

  if (view.childrenHeight) {
    ctx.strokeStyle = "#383535";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const x = view.x.currentValue + constants.squareSize / 2;
    const y = view.y.currentValue + view.rowHeight;
    ctx.moveTo(x, y - constants.lineExtraSpace);
    ctx.lineTo(x, y + view.childrenHeight + constants.lineExtraSpace);
    ctx.stroke();
  }

  if (constants.showBorder) {
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, view.y.currentValue);
    ctx.lineTo(10000, view.y.currentValue);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

export const getTextCoordinates = (view: View) => {
  const squareY = view.y.currentValue + view.rowHeight / 2;
  return {
    y: squareY,
    x: view.x.currentValue + constants.squareSize + constants.textLeftMargin,
  };
};

const drawFullWidthBar = (
  ctx: CanvasRenderingContext2D,
  y: number,
  height: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, 100000, height);
};

const drawRectAtCenter = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: number,
  color: string,
  isOutlined = false
) => {
  if (isOutlined) {
    ctx.fillStyle = color;
    ctx.fillRect(x - side / 2 - 0.5, y - side / 2 - 0.5, side, side);
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - side / 2, y - side / 2, side - 1, side - 1);
  }
};

const roundToHalf = (val: number) => Math.floor(val) + 0.5;
const round = (val: number) => Math.round(val);
