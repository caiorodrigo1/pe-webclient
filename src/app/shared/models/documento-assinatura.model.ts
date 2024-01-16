export interface IDocumentoAssinatura {
  id?: number;
  pecaId?: number;
  nomeArquivo?: string;
  linkArquivo?: string;
  tipo?: string;
  dataEnvio?: string;
  orgaoOrigem?: string;
  usuarioOrigem?: string;
  usuarioDestino?: string;
  situacao?: string;
}

export class DocumentoAssinatura implements IDocumentoAssinatura {
  constructor(
    public id?: number,
    public pecaId?: number,
    public nomeArquivo?: string,
    public linkArquivo?: string,
    public tipo?: string,
    public dataEnvio?: string,
    public orgaoOrigem?: string,
    public usuarioOrigem?: string,
    public usuarioDestino?: string,
    public situacao?: string
  ) {}
}
