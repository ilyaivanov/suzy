import type { Item } from "../tree/core";
import { Remove } from "./remove";

export type Action = Rename | Remove;

export type Rename = {
  type: "rename";
  item: Item;
  oldName: string;
  newName: string;
};

// Create
// Move
