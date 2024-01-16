export interface IAssuntoProcesso {
  id?: number;
  codigo?: string;
  nome?: string;
  nomeCompleto?: string;
}

export class AssuntoProcesso implements IAssuntoProcesso {
  constructor(
    public id?: number,
    public codigo?: string,
    public nome?: string,
    public nomeCompleto?: string
  ) {}
}
