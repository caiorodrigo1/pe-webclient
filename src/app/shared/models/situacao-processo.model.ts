import { ISetor } from './setor.model';

export interface ISituacaoProcesso {
  id?: number;
  nome?: string;
  setorId?: number;
  setor?: ISetor;
}

export class SituacaoProcesso implements ISituacaoProcesso {
  constructor(
    public id?: number,
    public nome?: string,
    public setorId?: number,
    public Setor?: ISetor
  ) {}
}
