export interface ITipoDocumento {
  id?: number;
  nome?: string;
}

export class TipoDocumento implements ITipoDocumento {
  constructor(public id?: number, public nome?: string) {}
}
