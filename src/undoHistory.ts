import { doCreate, undoCreate } from "./editing/create";
import { doMove, undoMove } from "./editing/move";
import { doRemove, undoRemove } from "./editing/remove";
import { doRename, undoRename } from "./editing/rename";
import { Action } from "./editing/types";
import { centerOnItem, MyCanvas } from "./canvas";
import { Tree } from "./tree/core";

export const doAction = (
  tree: Tree,
  canvas: MyCanvas,
  action: Action | undefined
) => {
  if (action) {
    addActionToHistory(action);
    performAction(tree, canvas, action);
  }
};

const performAction = (tree: Tree, canvas: MyCanvas, action: Action) => {
  console.log("Performing action ", action.type);
  if (action.type === "remove") doRemove(tree, action);
  else if (action.type === "rename") doRename(action);
  else if (action.type === "move") doMove(action);
  else if (action.type === "create") doCreate(action);
  else assumeNever(action);

  //waiting for views to update coordinates
  requestAnimationFrame(() => centerOnItem(canvas, action.item));
};

export const undoAction = (tree: Tree, canvas: MyCanvas) => {
  if (currentIndex != -1) {
    const action = history[currentIndex];
    console.log("Undoing action ", action.type);
    if (action.type === "remove") undoRemove(tree, action);
    else if (action.type === "rename") undoRename(action);
    else if (action.type === "move") undoMove(action);
    else if (action.type === "create") undoCreate(tree, action);
    else assumeNever(action);

    currentIndex -= 1;

    //waiting for views to update coordinates
    requestAnimationFrame(() => centerOnItem(canvas, action.item));
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

function assumeNever(arg: never) {}
