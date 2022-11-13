export const div = (className: string, ...children: (Node | string)[]) => {
  const res = document.createElement("div");

  if (className) res.classList.add(className);

  if (children) res.append(...children);
  return res;
};

type Props = { value: number; onChange: (val: number) => void };
export const inputRange = (props: Props) => {
  const res = document.createElement("input");
  res.type = "range";
  res.value = "" + props.value;

  res.addEventListener("input", (e) =>
    props.onChange(+(e.currentTarget as HTMLInputElement).value)
  );

  return res;
};
