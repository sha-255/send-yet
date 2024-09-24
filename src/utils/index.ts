import { IIndication, IMember } from "@/dtos";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

const DEFAULT_ID_COLUMN_NAME = "~";
const FILE_NAME = "Table";
const FILE_EXTENSION = ".csv";
const START_MESSAGE = "File saved in ";

const getFileName = (): string => {
  return `${FILE_NAME}_${new Date()
    .toString()
    .replaceAll(" ", "_")
    .split("_(")[0]
    .replaceAll("+", "p")
    .replaceAll("-", "m")
    .replaceAll(":", "")}${FILE_EXTENSION}`;
};

export const exportToCsv = async (value: [][]): Promise<string> => {
  const delimiter = ",";
  let csvString = "";
  value.forEach((rowValue) => {
    rowValue.forEach((colValue) => {
      csvString += colValue + delimiter;
    });
    csvString += "\r\n";
  });
  csvString = "data:application/csv," + encodeURIComponent(csvString);
  return await saveCsvString(csvString);
};

const saveCsvString = async (data: string): Promise<string> => {
  const fileName = getFileName();
  if (Capacitor.isNativePlatform()) {
    return await nativeSave(fileName, data);
  } else {
    return await webSave(fileName, data);
  }
};

const nativeSave = async (path: string, data: string): Promise<string> => {
  try {
    await Filesystem.writeFile({
      path,
      data,
      directory: Directory.Documents,
    });
    const { uri } = await Filesystem.getUri({
      path,
      directory: Directory.Documents,
    });
    return START_MESSAGE + uri;
  } catch (error) {
    const errorMsg = "Unable to write file" + error;
    console.error(errorMsg);
    return errorMsg;
  }
};

const webSave = async (path: string, data: string): Promise<string> => {
  const el = document.createElement("a");
  el.setAttribute("href", data);
  el.setAttribute("download", path);
  document.body.appendChild(el);
  el.click();
  return START_MESSAGE + "download folder";
};

export const memberParse = (
  members: IMember[],
  idColumnName: string = DEFAULT_ID_COLUMN_NAME
): [][] => {
  if (!members.length) return [];
  const result: [][] = [];
  result.push(getHeaders(members, idColumnName) as []);

  members.forEach((member: IMember) => {
    const row = [];
    row.push(member.id + 1);
    member.indications.forEach((indication: IIndication) => {
      row.push(indication.value);
    });
    result.push(row as []);
  });
  return result;
};

const getHeaders = (
  members: IMember[],
  idName: string = DEFAULT_ID_COLUMN_NAME
): string[] => [
  idName,
  ...members[0].indications.map(
    (indication: IIndication) => indication.header.name
  ),
];
