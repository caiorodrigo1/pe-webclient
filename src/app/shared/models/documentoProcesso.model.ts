import { IAnexo } from './anexo.model';
import { IDespacho } from './despacho.model';
import { IDocumento } from './documento.model';

export interface IDocumentoProcesso {
  modelo: 'despacho' | 'documento' | 'anexo';
  documento?: IDocumento | IDespacho | IAnexo;
  tipo?: string;
  extensao?: string;
  nomeAssunto?: string;
  data?: string;
}

export class DocumentoProcesso implements IDocumentoProcesso {
  constructor(
    public modelo: 'despacho' | 'documento' | 'anexo',
    public documento?: IDocumento | IDespacho | IAnexo,
    public tipo?: string,
    public extensao?: string,
    public nomeAssunto?: string,
    public data?: string
  ) {}
}
