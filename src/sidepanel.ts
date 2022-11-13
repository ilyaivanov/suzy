import { div, inputRange } from "./html";
import constants from "./constants";

type Props = {
  onChange: () => void;
};

let isVisible = true;
export const createSidepanel = ({ onChange }: Props) => {
  const res = div("sidepanel");

  Object.keys(constants).forEach((key) => {
    const getValue = (): number | unknown => (constants as any)[key];
    const setValue = (key: string, v: number) => ((constants as any)[key] = v);

    const value = getValue();
    if (typeof value === "number") {
      const cell = div("row-value", "" + value);

      res.appendChild(
        div(
          "row",
          div("row-text", camelCaseToTitleCase(key)),
          inputRange({
            value: value,
            onChange: (val: number) => {
              setValue(key, val);
              cell.textContent = "" + val;
              onChange();
            },
          }),
          cell
        )
      );
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code == "KeyL" && e.ctrlKey) {
      e.preventDefault();
      isVisible = !isVisible;
      res.classList.toggle("hidden", !isVisible);
    }
  });

  return res;
};

const camelCaseToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
