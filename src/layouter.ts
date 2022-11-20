import { spring, Spring } from "./animations";
import constants from "./constants";
import { isRoot, Item } from "./core";

export type View = {
  x: Spring;
  y: Spring;
  fontSize: number;
  fontWeight: number;
  rowHeight: number;

  childrenHeight: number | undefined;
  item: Item;

  opacity: Spring;
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
      x: spring(x),
      y: spring(rowTop),
      opacity: spring(1),
      item: focused,
      fontSize: constants.focusedFontSize,
      rowHeight: constants.focusedRowHeight,
      fontWeight: 500,
      childrenHeight: undefined,
    });
    rowTop += constants.focusedRowHeight;
  }

  const onItem = (item: Item, level: number): number => {
    const view: View = {
      x: spring(x + level * constants.xStep),
      y: spring(rowTop),
      opacity: spring(1),
      item: item,
      rowHeight: constants.rowHeight,
      fontSize: constants.fontSize,
      fontWeight: 400,
      childrenHeight: undefined,
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
  ctx: CanvasRenderingContext2D,
  view: View,
  focusedItem: Item,
  selectedItem: Item
) => {
  const circleY = view.y.currentValue + view.rowHeight / 2;

  if (view.item !== focusedItem)
    drawRectAtCenter(
      ctx,
      // need to extract rounding into separate function to make pixel perfect rectangles
      view.x.currentValue + constants.squareSize / 2,
      circleY,
      constants.squareSize,
      "#FFFFFF",
      view.item.children.length > 0
    );

  ctx.fillStyle = "white";
  ctx.font = `${view.fontWeight} ${view.fontSize}px ${constants.font}`;
  ctx.textBaseline = "middle";
  ctx.fillText(
    view.item.title,
    view.x.currentValue + constants.squareSize + constants.textLeftMargin,
    circleY
  );

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
};

const drawFullWidthBar = (
  ctx: CanvasRenderingContext2D,
  y: number,
  height: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, 10000, height);
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
