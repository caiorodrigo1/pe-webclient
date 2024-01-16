export interface ITipoProcesso {
  id?: number;
  nome?: string;
  tramitaMultSetor?: string;
}

export class TipoProcesso implements ITipoProcesso {
  constructor(
    public id?: number,
    public nome?: string,
    public tramitaMultSetor?: string
  ) {}
}
