import { IAssuntoProcesso } from './assunto-processo.model';
import { IOrgao } from './orgao.model';
import { ISetor } from './setor.model';
import { ITipoDocumento } from './tipo-documento.model';

export interface IEtapaFluxo {
  id?: number;
  fluxoProcessoId?: number;
  nome?: string;
  descricao?: string;
  orgaoId?: number;
  orgao?: IOrgao;
  setorId?: number;
  setor?: ISetor;
  tipoDocumentoId?: number;
  tipoDocumento?: ITipoDocumento;
}

export class EtapaFluxo implements IEtapaFluxo {
  constructor(
    public id?: number,
    public fluxoProcessoId?: number,
    public nome?: string,
    public descricao?: string,
    public orgaoId?: number,
    public orgao?: IOrgao,
    public setorId?: number,
    public setor?: ISetor,
    public tipoDocumentoId?: number,
    public tipoDocumento?: ITipoDocumento
  ) {}
}

export interface IFluxoProcesso {
  id?: number;
  nome?: string;
  descricao?: string;
  assuntoId?: number;
  assunto?: IAssuntoProcesso;
  etapaFluxo?: IEtapaFluxo[];
}

export class FluxoProcesso implements IFluxoProcesso {
  constructor(
    public id?: number,
    public nome?: string,
    public descricao?: string,
    public assuntoId?: number,
    public assunto?: IAssuntoProcesso,
    public etapaFluxo?: IEtapaFluxo[]
  ) {}
}
