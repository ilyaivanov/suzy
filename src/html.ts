export const div = (className: string, ...children: Node[]) => {
  const res = document.createElement("div");
  res.classList.add(className);

  if (children) res.append(...children);
  return res;
};
