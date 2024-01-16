export interface IPapeisUsuario {
  id?: number;
  nome?: string;
  coordenadorSetor?: boolean;
  criaProcesso?: boolean;
  alteraProcesso?: boolean;
  arquivaProcesso?: boolean;
  tramitaProcesso?: boolean;
  visualizaTramitacao?: boolean;
  visualizaSigiloso?: boolean;
  visualizaRestrito?: boolean;
}

export class PapeisUsuario implements IPapeisUsuario {
  constructor(
    public id?: number,
    public nome?: string,
    public coordenadorSetor?: boolean,
    public criaProcesso?: boolean,
    public alteraProcesso?: boolean,
    public arquivaProcesso?: boolean,
    public tramitaProcesso?: boolean,
    public visualizaTramitacao?: boolean,
    public visualizaSigiloso?: boolean,
    public visualizaRestrito?: boolean
  ) {}
}
