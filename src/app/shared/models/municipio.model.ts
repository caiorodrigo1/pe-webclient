export interface IMunicipio {
  id?: number;
  nome?: string;
  uf?: string;
  codigoIbge?: string;
  codigoIBGE?: string;
  ativo?: boolean;
}

export class Municipio implements IMunicipio {
  constructor(
    public id?: number,
    public nome?: string,
    public uf?: string,
    public codigoIbge?: string,
    public codigoIBGE?: string,
    public ativo?: boolean
  ) {}
}
