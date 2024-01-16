export interface ISignatario {
  id?: number;
  nomeUsuario?: string;
  cargoUsuario?: string;
  observacao?: string;
  identificadorUsuario?: string;
  UsuarioId?: number;
  usuarioOrigemId?: number;
  usuarioDestinoId?: number;
  usuarioOrigem?: string;
  statusSignatario?: string;
  dataCadastro?: string;
  dataAssinatura?: string;
}

export class Signatario implements ISignatario {
  constructor(
    public id?: number,
    public nomeUsuario?: string,
    public cargoUsuario?: string,
    public observacao?: string,
    public identificadorUsuario?: string,
    public UsuarioId?: number,
    public usuarioOrigemId?: number,
    public usuarioDestinoId?: number,
    public usuarioOrigem?: string,
    public statusSignatario?: string,
    public dataCadastro?: string,
    public dataAssinatura?: string
  ) {}
}

export interface ISignatarioRequest {
  documentoId?: number;
  anexoId?: number;
  signatarios?: ISignatario[];
}
