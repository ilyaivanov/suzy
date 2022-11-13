import { div } from "./html";

let width = 0;
let height = 0;

let ctx: CanvasRenderingContext2D;

const draw = () => {
  ctx.fillStyle = "#aa00aa";
  ctx.beginPath();

  ctx.arc(
    width / 2,
    height / 2,
    Math.min(width / 2, height / 2) * 0.8,
    0,
    Math.PI * 2
  );
  ctx.fill();
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
