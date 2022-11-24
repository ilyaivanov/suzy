import { MyCanvas } from "./canvas";
import constants from "./constants";
import { Spring } from "./framework/animations";
import { Item } from "./tree/core";

export type View = {
  x: Spring;
  y: Spring;
  opacity: Spring;

  // everything here that is not a Spring is questionable
  fontSize: number;
  fontWeight: number;
  rowHeight: number;

  childrenHeight: number | undefined;
  item: Item;

  isDisappearing: boolean;
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
  ctx.globalAlpha = 1;

  if (view.item == selectedItem) {
    drawFullWidthBar(
      ctx,
      view.y.currentValue,
      view.rowHeight,
      `rgba(255,255,255,${constants.selectedBarAlpha})`
    );
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
