import constants from "./constants";
import { Item, Tree } from "./tree/core";
import { div } from "./frame/html";
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

  scale: number;
};

export const drawCanvas = (canvas: MyCanvas, tree: Tree) => {
  const { ctx, focusedItem, getMapWidth } = canvas;
  const mapWidth = getMapWidth();

  ctx.scale(canvas.scale, canvas.scale);
  if (!focusedItem || !tree.selectedItem) return;

  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  ctx.translate(0, -canvas.pageOffset);

  for (const [item, view] of canvas.views) {
    drawView(ctx, view, focusedItem, tree.selectedItem);
  }

  // Drawing minimap
  ctx.resetTransform();
  ctx.scale(canvas.scale, canvas.scale);

  ctx.shadowColor = "black";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#1E2021";
  ctx.fillRect(canvas.width - mapWidth, 0, mapWidth, canvas.height);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(200,200,200,0.15)";
  ctx.fillRect(
    canvas.width - mapWidth,
    canvas.pageOffset / constants.minimapScale,
    mapWidth,
    canvas.height / constants.minimapScale
  );

  ctx.resetTransform();
  ctx.translate(canvas.canvasEl.width - mapWidth * canvas.scale, 0);
  ctx.scale(
    canvas.scale / constants.minimapScale,
    canvas.scale / constants.minimapScale
  );
  for (const [item, view] of canvas.views) {
    drawView(ctx, view, focusedItem, tree.selectedItem);
  }

  ctx.resetTransform();
};

export const createCanvas = (): MyCanvas => {
  const canvas = document.createElement("canvas");
  const scale = window.devicePixelRatio || 1;
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

    scale,

    getMapWidth: () => canvas.width / scale / (constants.minimapScale + 1),
  };
};

// setting canvas dimensions exactly as it's container
// canvas is not an usual element in a sense that I need to explicitly set width and height
export const resizeCanvas = (canvas: MyCanvas) => {
  const width = canvas.container.clientWidth;
  const height = canvas.container.clientHeight;

  // outer physical minesions (aka CSS pixels)
  canvas.canvasEl.style.width = width + "px";
  canvas.canvasEl.style.height = height + "px";

  // inner logical dimensions (akka DOM pixels)
  canvas.canvasEl.width = width * canvas.scale;
  canvas.canvasEl.height = height * canvas.scale;

  canvas.width = width;
  canvas.height = height;
};
