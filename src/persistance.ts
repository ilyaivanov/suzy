export const saveToFile = async (str: string) => {
  const fileHandle = await (window as any).showSaveFilePicker({
    suggestedName: "viztly.json",
    types: [
      {
        description: "JSON File",
        accept: {
          "json/*": [".json"],
        },
      },
    ],
  });

  const myFile = await fileHandle.createWritable();
  await myFile.write(str);
  await myFile.close();
};

export const loadFromFile = async (): Promise<string> => {
  const [fileHandle] = await (window as any).showOpenFilePicker({
    types: [
      {
        description: "Viztly json",
        accept: {
          "json/*": [".json"],
        },
      },
    ],
  });

  const fileData = await fileHandle.getFile();
  return await fileData.text();
};

export const saveToLocalStorage = (str: string) =>
  localStorage.setItem("viztly:v3", str);

export const loadFromLocalStorage = (): string | undefined =>
  localStorage.getItem("viztly:v3") || undefined;
