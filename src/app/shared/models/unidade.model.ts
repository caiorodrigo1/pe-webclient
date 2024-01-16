export interface IUnidade {
  id?: number;
  nome?: string;
  ativo?: boolean;
}

export class Unidade implements IUnidade {
  constructor(
    public id?: number,
    public nome?: string,
    public ativo: boolean = true
  ) {}
}
