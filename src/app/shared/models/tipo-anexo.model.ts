export interface ITipoAnexo {
  id?: number;
  nome?: string;
}

export class TipoAnexo implements ITipoAnexo {
  constructor(public id?: number, public nome?: string) {}
}
