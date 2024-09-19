export interface IMember {
  id: number;
  indications: IIndication[];
}

export interface IIndication {
  header: IIndicationHeader;
  value: number;
}

export interface IIndicationHeader {
  name: string;
}
