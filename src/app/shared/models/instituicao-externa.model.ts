export interface IInstituicaoExterna {
  id?: number;
  nome?: string;
  sigla?: string;
  unidadeOrganizacional?: string;
  siglaUnidadeOrganizacional?: string;
  responsavel?: string;
  cargoDoResponsavel?: string;
  tratamento?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}

export class InstituicaoExterna implements IInstituicaoExterna {
  constructor(
    public id?: number,
    public nome?: string,
    public sigla?: string,
    public unidadeOrganizacional?: string,
    public siglaUnidadeOrganizacional?: string,
    public responsavel?: string,
    public cargoDoResponsavel?: string,
    public tratamento?: string,
    public cep?: string,
    public endereco?: string,
    public cidade?: string,
    public estado?: string
  ) {}
}
