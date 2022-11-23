import { doRemove, undoRemove } from "./actions/remove";
import { Action } from "./actions/types";
import { MyCanvas } from "./canvas";
import { Tree } from "./tree/core";

export const doAction = (tree: Tree, canvas: MyCanvas, action: Action) => {
  addActionToHistory(action);
  performAction(tree, canvas, action);
};

const performAction = (tree: Tree, canvas: MyCanvas, action: Action) => {
  if (action.type === "remove") doRemove(tree, canvas, action);
};

export const undoAction = (tree: Tree, canvas: MyCanvas) => {
  if (currentIndex != -1) {
    const lastAction = history[currentIndex];
    if (lastAction.type === "remove") undoRemove(tree, canvas, lastAction);
    currentIndex -= 1;
  }
};

export const redoAction = (tree: Tree, canvas: MyCanvas) => {
  if (currentIndex < history.length - 1) {
    currentIndex += 1;
    const actionToRedo = history[currentIndex];
    performAction(tree, canvas, actionToRedo);
  }
};

let currentIndex = -1;
const history: Action[] = [];
const addActionToHistory = (action: Action) => {
  if (currentIndex < history.length - 1) {
    history.splice(currentIndex + 1);
  }
  history.push(action);
  currentIndex += 1;
};
