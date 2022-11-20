import constants from "./constants";
import { Item, Tree } from "./core";
import { div } from "./html";
import { drawView, View } from "./layouter";

export type MyCanvas = {
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;

  focusedItem: Item | undefined;

  pageOffset: number;

  pageHeight: number;

  getMapWidth: () => number;

  views: Map<Item, View>;
};

export const drawCanvas = (canvas: MyCanvas, tree: Tree) => {
  const { ctx, focusedItem, getMapWidth } = canvas;
  const mapWidth = getMapWidth();
  if (!focusedItem || !tree.selectedItem) return;

  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  ctx.shadowColor = "black";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#1E2021";
  ctx.fillRect(
    canvas.canvasEl.width - mapWidth,
    0,
    mapWidth,
    canvas.canvasEl.height
  );

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(200,200,200,0.15)";
  ctx.fillRect(
    canvas.canvasEl.width - mapWidth,
    canvas.pageOffset / constants.minimapScale,
    mapWidth,
    canvas.canvasEl.height / constants.minimapScale
  );

  ctx.translate(0, -canvas.pageOffset);

  for (const [item, view] of canvas.views) {
    drawView(canvas, view, focusedItem, tree.selectedItem);
  }

  // Drawing minimap
  ctx.resetTransform();
  ctx.translate(canvas.width - mapWidth, 0);
  ctx.scale(1 / constants.minimapScale, 1 / constants.minimapScale);
  for (const [item, view] of canvas.views) {
    drawView(canvas, view, focusedItem, tree.selectedItem);
  }

  ctx.resetTransform();
  // drawScroll(canvas);
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

export const createCanvas = (): MyCanvas => {
  const canvas = document.createElement("canvas");

  return {
    canvasEl: canvas,
    container: div("canvas-container", canvas),
    ctx: canvas.getContext("2d")!,

    views: new Map(),
    focusedItem: undefined,

    // waiting until container is added into DOM to set dimensions
    width: 0,
    height: 0,
    pageOffset: 0,
    pageHeight: 0,

    getMapWidth: () => canvas.width / (constants.minimapScale + 1),
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
