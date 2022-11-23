import { createTree, item, root } from "./core";

export default createTree(
  root([
    item("a1"),
    item("a2"),
    item("a3", [item("b1"), item("b2"), item("3")]),
    item("c1"),
  ])
);
