import { createTree, item, root } from "./core";

export default createTree(root([item("a", [item("b")]), item("c")]));
