export interface IEndereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  cidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

export class Endereco implements IEndereco {
  constructor(
    public cep?: string,
    public logradouro?: string,
    public numero?: string,
    public complemento?: string,
    public bairro?: string,
    public localidade?: string,
    public cidade?: string,
    public uf?: string,
    public ibge?: string,
    public gia?: string,
    public ddd?: string,
    public siafi?: string,
    public erro?: boolean
  ) {}
}
