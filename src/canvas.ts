import constants from "./constants";
import { isRoot, Item, Tree } from "./core";
import { div } from "./html";
import { buildViews, View } from "./layouter";

type MyCanvas = {
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;

  focusedItem: Item | undefined;

  pageOffset: number;

  pageHeight: number;
};

export const drawCanvas = (canvas: MyCanvas, tree: Tree) => {
  const { ctx, canvasEl, focusedItem } = canvas;
  if (!focusedItem) return;

  let views: View[] = [];

  let lastY = 0;
  buildViews(canvasEl.width, focusedItem, (view) => {
    views.push(view);
    lastY = view.y;
  });

  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  ctx.translate(0, -canvas.pageOffset);

  for (const view of views) {
    if (view.item !== focusedItem)
      drawRectAtCenter(
        ctx,
        // need to extract rounding into separate function to make pixel perfect rectangles
        view.x + constants.squareSize / 2,
        view.y + view.rowHeight / 2,
        constants.squareSize,
        "#FFFFFF",
        view.item.children.length > 0
      );

    ctx.fillStyle = "white";
    ctx.font = `${view.fontWeight} ${view.fontSize}px ${constants.font}`;
    ctx.textBaseline = "middle";
    ctx.fillText(
      view.item.title,
      view.x + constants.squareSize + constants.textLeftMargin,
      view.y + view.rowHeight / 2
    );

    if (view.item == tree.selectedItem) {
      drawFullWidthBar(
        ctx,
        view.y,
        view.rowHeight,
        `rgba(255,255,255,${constants.selectedBarAlpha})`
      );
    }

    if (constants.showBorder) {
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, view.y);
      ctx.lineTo(10000, view.y);
      ctx.stroke();
    }
  }

  canvas.pageHeight = lastY + constants.rowHeight + constants.bottomPageMargin;

  ctx.resetTransform();
  drawScroll(canvas);
};

const drawScroll = (canvas: MyCanvas) => {
  const { pageHeight } = canvas;
  const canvasHeight = canvas.canvasEl.height;
  if (pageHeight <= canvasHeight) return;

  const canvasWidth = canvas.canvasEl.width;
  const scrollWidth = 12;
  const scrollHeight = (canvasHeight * canvasHeight) / pageHeight;

  const scrollOffset = canvas.pageOffset * (canvasHeight / pageHeight);

  canvas.ctx.fillStyle = "gray";
  canvas.ctx.fillRect(
    canvasWidth - scrollWidth,
    scrollOffset,
    scrollWidth,
    scrollHeight
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
    pageOffset: 0,
    pageHeight: 0,
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
