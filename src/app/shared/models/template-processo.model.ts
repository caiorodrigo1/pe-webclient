import { ITipoProcesso } from './tipo-processo.model';

export interface ITemplateProcesso {
  id?: number;
  nome?: string;
  texto?: string;
  tipoId?: number;
  tipo?: ITipoProcesso;
}

export class TemplateProcesso implements ITemplateProcesso {
  constructor(
    public id?: number,
    public nome?: string,
    public texto?: string,
    public tipoId?: number,
    public tipo?: ITipoProcesso
  ) {}
}
