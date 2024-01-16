export interface IFuncao {
  id?: number;
  nome?: string;
  descricao?: string;
}

export class Funcao implements IFuncao {
  constructor(
    public id?: number,
    public nome?: string,
    public descricao?: string
  ) {}
}
