export interface IDespacho {
  id?: number;
  processoId?: number;
  nomeSetor?: string;
  nome?: string;
  assunto?: string;
  texto?: string;
  observacao?: string;
  dataCadastro?: string;
  linkArquivo?: string;
}

export class Despacho implements IDespacho {
  constructor(
    public id?: number,
    public processoId?: number,
    public nomeSetor?: string,
    public nome?: string,
    public assunto?: string,
    public texto?: string,
    public observacao?: string,
    public dataCadastro?: string,
    public linkArquivo?: string
  ) {}
}
