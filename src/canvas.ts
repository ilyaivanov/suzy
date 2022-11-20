import constants from "./constants";
import { Item, Tree } from "./core";
import { div } from "./html";
import { buildViews, drawView, View } from "./layouter";

type MyCanvas = {
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;

  focusedItem: Item | undefined;

  pageOffset: number;

  pageHeight: number;

  views: Map<Item, View>;
};

export const drawCanvas = (canvas: MyCanvas, tree: Tree) => {
  const { ctx, canvasEl, focusedItem } = canvas;
  if (!focusedItem || !tree.selectedItem) return;

  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  ctx.translate(0, -canvas.pageOffset);

  for (const [item, view] of canvas.views) {
    drawView(ctx, view, focusedItem, tree.selectedItem);
  }

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

export const buildCanvasViews = (canvas: MyCanvas) => {
  let pageHeight = 0;

  buildViews(canvas.canvasEl.width, canvas.focusedItem!, (view) => {
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
  buildViews(canvas.canvasEl.width, canvas.focusedItem!, (view) => {
    const existingView = canvas.views.get(view.item);
    // I don't like the fact that view has already springs inside, which we don't use at all
    if (existingView) {
      viewToRemove.delete(existingView.item);
      existingView.y.to(view.y.currentValue);
      existingView.x.to(view.x.currentValue);
      existingView.childrenHeight = view.childrenHeight;

      existingView.fontSize = view.fontSize;
      existingView.fontWeight = view.fontWeight;
      existingView.rowHeight = view.rowHeight;
    } else {
      canvas.views.set(view.item, view);
      // enter animation
    }
    if (view.y.currentValue + view.rowHeight > pageHeight)
      pageHeight = view.y.currentValue + view.rowHeight;
  });

  viewToRemove.forEach((key) => canvas.views.delete(key));
  canvas.pageHeight = pageHeight + constants.bottomPageMargin;
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
