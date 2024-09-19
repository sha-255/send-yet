import { IIndication, IMember } from "@/dtos";

const DEFAULT_ID_COLUMN_NAME = "~";

export const exportToCsv = (value: [][]) => {
  const delimiter = ",";
  let csvString = "";
  value.forEach((rowValue) => {
    rowValue.forEach((colValue) => {
      csvString += colValue + delimiter;
    });
    csvString += "\r\n";
  });

  csvString = "data:application/csv," + encodeURIComponent(csvString);
  const el = document.createElement("A");
  el.setAttribute("href", csvString);
  el.setAttribute("download", "someData.csv");
  document.body.appendChild(el);
  el.click();
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
