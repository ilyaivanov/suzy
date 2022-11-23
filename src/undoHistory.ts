import { doMove, undoMove } from "./actions/move";
import { doRemove, undoRemove } from "./actions/remove";
import { doRename, undoRename } from "./actions/rename";
import { Action } from "./actions/types";
import { Tree } from "./tree/core";

export const doAction = (tree: Tree, action: Action | undefined) => {
  if (action) {
    addActionToHistory(action);
    performAction(tree, action);
  }
};

const performAction = (tree: Tree, action: Action) => {
  console.log("Performing action ", action.type);
  if (action.type === "remove") doRemove(tree, action);
  else if (action.type === "rename") doRename(action);
  else if (action.type === "move") doMove(action);
  else assumeNever(action);
};

export const undoAction = (tree: Tree) => {
  if (currentIndex != -1) {
    const action = history[currentIndex];
    console.log("Undoing action ", action.type);
    if (action.type === "remove") undoRemove(tree, action);
    else if (action.type === "rename") undoRename(action);
    else if (action.type === "move") undoMove(action);
    else assumeNever(action);
    currentIndex -= 1;
  }
};

export const redoAction = (tree: Tree) => {
  if (currentIndex < history.length - 1) {
    currentIndex += 1;
    const actionToRedo = history[currentIndex];
    performAction(tree, actionToRedo);
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
