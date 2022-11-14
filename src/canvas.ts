import constants from "./constants";
import { Item, Tree } from "./core";
import { div } from "./html";

type MyCanvas = {
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
  container: HTMLDivElement;
  ctx: CanvasRenderingContext2D;
};

export const drawCanvas = ({ ctx }: MyCanvas, tree: Tree) => {
  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  let y = constants.yStart;

  const onItem = (item: Item, level: number) => {
    const localX = constants.xStart + level * constants.xStep;

    if (item.children.length > 0) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(localX, y, constants.squareSize, constants.squareSize);
    } else {
      ctx.strokeStyle = "#FFFFFF";
      ctx.strokeRect(
        localX + 0.5,
        y + 0.5,
        constants.squareSize - 1,
        constants.squareSize - 1
      );
    }

    ctx.fillStyle = "white";
    ctx.font = `${constants.fontSize}px ${constants.font}`;
    ctx.textBaseline = "middle";
    ctx.fillText(
      item.title,
      localX + constants.squareSize + constants.textLeftMargin,
      y + constants.squareSize / 2
    );

    if (item == tree.selectedItem) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      const barHeight = constants.yStep;
      ctx.fillRect(
        0,
        y - barHeight / 2 + constants.squareSize / 2,
        10000,
        barHeight
      );
    }

    y += constants.yStep;

    if (item.isOpen) item.children.forEach((sub) => onItem(sub, level + 1));
  };

  tree.root.children.forEach((child) => onItem(child, 0));
};

export const createCanvas = (): MyCanvas => {
  const canvas = document.createElement("canvas");

  return {
    canvasEl: canvas,
    container: div("canvas-container", canvas),
    ctx: canvas.getContext("2d")!,

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
