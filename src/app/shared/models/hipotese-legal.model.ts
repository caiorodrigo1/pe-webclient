export interface IHipoteseLegal {
  id?: number;
  descricao?: string;
  ativo?: boolean;
}

export class HipoteseLegal implements IHipoteseLegal {
  constructor(
    public id?: number,
    public descricao?: string,
    public ativo?: boolean
  ) {}
}
