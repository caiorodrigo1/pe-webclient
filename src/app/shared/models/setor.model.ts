import { IOrgao } from './orgao.model';

export interface ISetor {
  id?: number;
  orgao?: IOrgao;
  orgaoId?: number;
  sigla?: string;
  descricao?: string;
  identificadorOrgao?: string;
  nomeUnidade?: string;
  ativo?: boolean;
}

export class Setor implements ISetor {
  constructor(
    public id?: number,
    public orgao?: IOrgao,
    public orgaoId?: number,
    public sigla?: string,
    public descricao?: string,
    public identificadorOrgao?: string,
    public nomeUnidade?: string,
    public ativo?: boolean
  ) {}
}
