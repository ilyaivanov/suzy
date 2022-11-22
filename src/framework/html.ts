export const div = (className: string, ...children: (Node | string)[]) => {
  const res = document.createElement("div");

  if (className) res.classList.add(className);

  if (children) res.append(...children);
  return res;
};

type Props<T> = { value: T; onChange: (val: T) => void };
export const inputRange = (props: Props<number>) => {
  const res = document.createElement("input");
  res.type = "range";
  res.value = "" + props.value;

  res.addEventListener("input", (e) =>
    props.onChange(+(e.currentTarget as HTMLInputElement).value)
  );

  return res;
};

export const inputCheckbox = (props: Props<boolean>) => {
  const res = document.createElement("input");
  res.type = "checkbox";
  res.checked = props.value;

  res.addEventListener("input", (e) =>
    props.onChange((e.currentTarget as HTMLInputElement).checked)
  );

  return res;
};

export const inputText = (props: Props<string>) => {
  const res = document.createElement("input");
  res.type = "text";

  res.addEventListener("input", (e) =>
    props.onChange((e.currentTarget as HTMLInputElement).value)
  );

  return res;
};
export const inputColor = (props: Props<string>) => {
  const res = document.createElement("input");
  res.type = "color";
  res.value = props.value;

  res.addEventListener("input", (e) =>
    props.onChange((e.currentTarget as HTMLInputElement).value)
  );

  return res;
};
