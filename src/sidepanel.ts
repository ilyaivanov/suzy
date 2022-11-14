import { div, inputRange } from "./html";
import constants from "./constants";

type Props = {
  onChange: () => void;
};

let isVisible = false;
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

  res.classList.toggle("hidden", !isVisible);
  return res;
};

export const toggleSidebarVisibility = (el: HTMLElement) => {
  isVisible = !isVisible;
  el.classList.toggle("hidden", !isVisible);
};

const camelCaseToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
