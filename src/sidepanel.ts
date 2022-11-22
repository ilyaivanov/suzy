import { div, inputCheckbox, inputColor, inputRange } from "./framework/html";
import constants from "./constants";

type Props = {
  onChange: () => void;
};

let isVisible = constants.showSidebarInitially;
export const createSidepanel = ({ onChange }: Props) => {
  const res = div("sidepanel");

  Object.keys(constants).forEach((key) => {
    const getValue = (): number | unknown => (constants as any)[key];
    const setValue = (key: string, v: unknown) => ((constants as any)[key] = v);

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
    } else if (typeof value === "boolean") {
      res.appendChild(
        div(
          "row",
          div("row-text", camelCaseToTitleCase(key)),
          inputCheckbox({
            value: value,
            onChange: (val) => {
              setValue(key, val);
              onChange();
            },
          })
        )
      );
    } else if (
      key.toLocaleLowerCase().endsWith("color") &&
      typeof value === "string"
    ) {
      res.appendChild(
        div(
          "row",
          div("row-text", camelCaseToTitleCase(key)),
          inputColor({
            value: value,
            onChange: (val) => {
              setValue(key, val);
              onChange();
            },
          })
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
