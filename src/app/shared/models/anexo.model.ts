import { ISignatario } from './signatario.model';
import { ITipoAnexo } from './tipo-anexo.model';

export interface IAnexo {
  id?: number;
  processoId?: number;
  nome?: string;
  nomeOriginal?: string;
  extensao?: string;
  tipoAnexoId?: number;
  tipoAnexo?: ITipoAnexo;
  identificador?: string;
  digitoValidador?: string;
  codigoValidador?: string;
  crc?: string;
  deletado?: boolean;
  dataCadastro?: string;
  dataAtualizacao?: string;
  dataDelecao?: string;
  linkArquivo?: string;
  signatarios?: ISignatario[];
}

export class Anexo implements IAnexo {
  constructor(
    public id?: number,
    public processoId?: number,
    public nome?: string,
    public nomeOriginal?: string,
    public extensao?: string,
    public tipoAnexoId?: number,
    public tipoAnexo?: ITipoAnexo,
    public identificador?: string,
    public digitoValidador?: string,
    public codigoValidador?: string,
    public crc?: string,
    public deletado?: boolean,
    public dataCadastro?: string,
    public dataAtualizacao?: string,
    public dataDelecao?: string,
    public linkArquivo?: string,
    public signatarios?: ISignatario[]
  ) {}
}

export interface IAnexoFile {
  chaveArquivo?: string;
  nome?: string;
  data?: File;
  tamanho?: number;
  extensao?: string;
  tipo?: ITipoAnexo;
}

export class AnexoFile implements IAnexoFile {
  constructor(
    public chaveArquivo?: string,
    public nome?: string,
    public data?: File,
    public tamanho?: number,
    public extensao?: string,
    public tipo?: ITipoAnexo
  ) {}
}

export interface IAnexoResult {
  chaveArquivo?: string;
  enviado?: boolean;
  nome?: string;
  metadata?: IAnexoFile;
  arquivo?: File;
}
