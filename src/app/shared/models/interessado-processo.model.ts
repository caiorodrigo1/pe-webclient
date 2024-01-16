export interface IInteressadoProcesso {
  id?: number;
  documento?: string;
  nome?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string;
  endereco?: string;
  observacao?: string;
  dataCadastro?: string;
  dataAdicionadoProcesso?: string;
}

export class InteressadoProcesso implements IInteressadoProcesso {
  constructor(
    public id?: number,
    public documento?: string,
    public nome?: string,
    public telefone?: string,
    public email?: string,
    public dataNascimento?: string,
    public endereco?: string,
    public observacao?: string,
    public dataCadastro?: string,
    public dataAdicionadoProcesso?: string
  ) {}
}
