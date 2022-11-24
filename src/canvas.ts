import constants from "./constants";
import { Item, Tree } from "./tree/core";
import { div } from "./framework/html";
import { drawView, View } from "./view";
import { spring, Spring, to } from "./framework/animations";
import { clamp } from "./tree/numbers";

export type MyCanvas = {
  width: number;
  height: number;
  x: number;
  y: number;
  canvasEl: HTMLCanvasElement;
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;

  focusedItem: Item | undefined;
  editedItem: Item | undefined;

  pageOffset: Spring;

  pageHeight: number;

  views: Map<Item, View>;

  scale: number;
};

export const drawCanvas = (canvas: MyCanvas, tree: Tree) => {
  const { ctx, focusedItem } = canvas;

  setDefaultTransform(canvas);

  if (!focusedItem || !tree.selectedItem) return;

  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  ctx.translate(0, -canvas.pageOffset.currentValue);

  for (const [item, view] of canvas.views) {
    drawView(canvas, view, focusedItem, tree.selectedItem);
  }

  // Drawing minimap
  setDefaultTransform(canvas);
  const mapWidth = getMapWidth(canvas);
  ctx.translate(canvas.width - mapWidth, 0);

  ctx.shadowColor = "black";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, mapWidth, canvas.height);

  ctx.shadowBlur = 0;

  ctx.fillStyle = `rgba(200,200,200,${constants.minimapViewportAlpha})`;
  ctx.fillRect(
    0,
    canvas.pageOffset.currentValue / constants.minimapScale,
    mapWidth,
    canvas.height / constants.minimapScale
  );

  ctx.scale(1 / constants.minimapScale, 1 / constants.minimapScale);
  for (const [item, view] of canvas.views) {
    drawView(canvas, view, focusedItem, tree.selectedItem);
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
    editedItem: undefined,

    // waiting until container is added into DOM to set dimensions
    width: 0,
    height: 0,
    pageOffset: spring(0),
    pageHeight: 0,
    x: 0,
    y: 0,

    scale,
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

  // inner logical dimensions (aka DOM pixels)
  canvas.canvasEl.width = width * canvas.scale;
  canvas.canvasEl.height = height * canvas.scale;

  const rect = canvas.canvasEl.getBoundingClientRect();
  canvas.x = rect.left;
  canvas.y = rect.top;
  canvas.width = width;
  canvas.height = height;
};

const setDefaultTransform = (canvas: MyCanvas) => {
  canvas.ctx.resetTransform();
  canvas.ctx.scale(canvas.scale, canvas.scale);
};
const getMapWidth = (canvas: MyCanvas) =>
  canvas.width / (constants.minimapScale + 1);

export const centerOnItem = (canvas: MyCanvas, item: Item) => {
  const view = canvas.views.get(item);
  if (view) {
    const rowCenter = view.y.targetValue + view.rowHeight / 2;
    if (
      rowCenter > canvas.pageOffset.targetValue + canvas.height ||
      rowCenter < canvas.pageOffset.targetValue
    ) {
      scrollToX(
        canvas,
        clamp(
          rowCenter - canvas.height / 2,
          0,
          canvas.pageHeight - canvas.height
        )
      );
    }
  }
};

export const changeFocus = (canvas: MyCanvas, item: Item, tree: Tree) => {
  canvas.focusedItem = item;

  // wait to rebuild the views
  requestAnimationFrame(
    () => tree.selectedItem && centerOnItem(canvas, tree.selectedItem)
  );
};

const scrollToX = (canvas: MyCanvas, offset: number) =>
  to(canvas.pageOffset, offset);
