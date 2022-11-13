import constants from "./constants";
import { div } from "./html";

let width = 0;
let height = 0;

let ctx: CanvasRenderingContext2D;

type Item = {
  title: string;
  children: Item[];
};

const root: Item = {
  title: "Root",
  children: [
    {
      title: "Music",
      children: [
        {
          title: "Music",
          children: [
            { title: "Music", children: [] },
            { title: "Stuff", children: [] },
            { title: "Another Stuff", children: [] },
          ],
        },
        { title: "Stuff", children: [] },
        {
          title: "Another Stuff",
          children: [
            { title: "Music", children: [] },
            { title: "Stuff", children: [] },
            { title: "Another Stuff", children: [] },
          ],
        },
      ],
    },
    { title: "Stuff", children: [] },
    { title: "Another Stuff", children: [] },
  ],
};

const draw = () => {
  ctx.fillStyle = "#1E2021";
  ctx.fillRect(0, 0, 1000000, 1000000);

  let y = constants.yStart;

  const onItem = (item: Item, level: number) => {
    const localX = constants.xStart + level * constants.xStep;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(localX, y, constants.squareSize, constants.squareSize);

    ctx.fillStyle = "white";
    ctx.font = `${constants.fontSize}px ${constants.font}`;
    ctx.textBaseline = "middle";
    ctx.fillText(
      item.title,
      localX + constants.squareSize + constants.textLeftMargin,
      y + constants.squareSize / 2
    );
    y += constants.yStep;

    if (item.children.length > 0)
      item.children.forEach((sub) => onItem(sub, level + 1));
  };

  root.children.forEach((child) => onItem(child, 0));
};

export const create = () => {
  const canvas = document.createElement("canvas");

  ctx = canvas.getContext("2d")!;

  const res = div("canvas-container", canvas);
  const onResize = () => {
    width = res.clientWidth;
    height = res.clientHeight;
    canvas.width = width;
    canvas.height = height;

    draw();
  };

  //waiting for element to be added into the DOM
  requestAnimationFrame(onResize);

  window.addEventListener("resize", onResize);

  onResize();
  return res;
};

export const updateCanvas = () => draw();
