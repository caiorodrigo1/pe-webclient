import { ITipoDocumento } from './tipo-documento.model';

export interface ITemplateDocumento {
  id?: number;
  nome?: string;
  template?: string;
  tipoDocumentoId?: number;
  tipoDocumento?: ITipoDocumento;
  signatarios?: any[];
}

export class TemplateDocumento implements ITemplateDocumento {
  constructor(
    public id?: number,
    public nome?: string,
    public template?: string,
    public tipoDocumentoId?: number,
    public tipoDocumento?: ITipoDocumento,
    public signatarios?: any[]
  ) {}
}
