import { createTree, item, root } from "./core";

export default createTree(
  root([
    item("First", [
      item("Fooo", [
        item("Music (closed)", {
          children: [
            item("Ambient"),
            item("Electro", [item("Electro 1")]),
            item("Metal", [
              item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
            ]),
          ],
          isOpen: false,
        }),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
    ]),

    item("Second", [
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
      item("Fooo", [
        item("Music", [
          item("Ambient"),
          item("Electro"),
          item("Metal", [
            item("Music", [item("Ambient"), item("Electro"), item("Metal")]),
          ]),
        ]),
      ]),
    ]),
  ])
);
