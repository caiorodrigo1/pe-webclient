import { ITipoDocumento } from './tipo-documento.model';

export interface IDocumento {
  id?: number;
  numeroDocumento?: number;
  numero?: number;
  processoId?: number;
  codigoValidador?: string;
  digitoValidador?: string;
  crc?: string;
  nome?: string;
  assunto?: string;
  texto?: string;
  conteudo?: string;
  observacao?: string;
  link?: string;
  linkArquivo?: string;
  tipoDocumentoId?: number;
  tipoDocumento?: ITipoDocumento;
  dataCadastro?: string;
  signatarios?: any[];
}

export class Documento implements IDocumento {
  constructor(
    public id?: number,
    public numeroDocumento?: number,
    public numero?: number,
    public processoId?: number,
    public codigoValidador?: string,
    public digitoValidador?: string,
    public crc?: string,
    public nome?: string,
    public assunto?: string,
    public texto?: string,
    public conteudo?: string,
    public observacao?: string,
    public link?: string,
    public linkArquivo?: string,
    public tipoDocumentoId?: number,
    public tipoDocumento?: ITipoDocumento,
    public dataCadastro?: string,
    public signatarios?: any[]
  ) {}
}
