import constants from "./constants";
import { isRoot, Item, Tree } from "./core";
import { div } from "./html";

type MyCanvas = {
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;

  focusedItem: Item | undefined;
};

export const drawCanvas = (
  { ctx, canvasEl, focusedItem }: MyCanvas,
  tree: Tree
) => {
  if (!focusedItem) return;

  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  let rowTop = isRoot(focusedItem) ? 0 : constants.focusedRowHeight;

  const leftMargin = Math.max((canvasEl.width - constants.maxWidth) / 2, 0);
  const onItem = (item: Item, level: number) => {
    const squareLeft =
      leftMargin + constants.leftRightCanvasPadding + level * constants.xStep;

    drawRectAtCenter(
      ctx,
      // need to extract rounding into separate function to make pixel perfect rectangles
      squareLeft + constants.squareSize / 2 + 0.5,
      rowTop + constants.rowHeight / 2,
      constants.squareSize,
      "#FFFFFF",
      item.children.length > 0
    );

    ctx.fillStyle = "white";
    ctx.font = `${constants.fontSize}px ${constants.font}`;
    ctx.textBaseline = "middle";
    ctx.fillText(
      item.title,
      squareLeft + constants.squareSize + constants.textLeftMargin,
      rowTop + constants.rowHeight / 2
    );

    if (item == tree.selectedItem) {
      drawFullWidthBar(
        ctx,
        rowTop,
        constants.rowHeight,
        `rgba(255,255,255,${constants.selectedBarAlpha})`
      );
    }

    if (constants.showBorder) {
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rowTop);
      ctx.lineTo(10000, rowTop);
      ctx.stroke();
    }

    rowTop += constants.rowHeight;

    if (item.isOpen) item.children.forEach((sub) => onItem(sub, level + 1));
  };

  //Focused title
  if (!isRoot(focusedItem)) {
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.font = `${constants.focusedFontSize}px ${constants.font}`;
    ctx.fillText(
      focusedItem.title,
      constants.leftRightCanvasPadding +
        constants.squareSize +
        constants.textLeftMargin,
      constants.focusedRowHeight / 2 + 2 //moving downt by eye for two pixels
    );

    //duplication
    if (focusedItem == tree.selectedItem) {
      ctx.fillStyle = `rgba(255,255,255,${constants.selectedBarAlpha})`;
      ctx.fillRect(0, 0, 10000, constants.focusedRowHeight);
    }
  }

  focusedItem?.children.forEach((child) =>
    onItem(child, isRoot(focusedItem) ? 0 : 1)
  );
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

export const createCanvas = (): MyCanvas => {
  const canvas = document.createElement("canvas");

  return {
    canvasEl: canvas,
    container: div("canvas-container", canvas),
    ctx: canvas.getContext("2d")!,

    focusedItem: undefined,

    // waiting until container is added into DOM to set dimensions
    width: 0,
    height: 0,
  };
};

// setting canvas dimensions exactly as it's container
// canvas is not an usual element in a sense that I need to explicitly set width and height
export const resizeCanvas = (canvas: MyCanvas) => {
  canvas.width = canvas.container.clientWidth;
  canvas.height = canvas.container.clientHeight;
  canvas.canvasEl.width = canvas.width;
  canvas.canvasEl.height = canvas.height;
};
