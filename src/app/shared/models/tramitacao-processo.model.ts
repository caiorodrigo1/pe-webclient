export interface ITramitacaoProcesso {
  id?: number;
  processoId?: number;
  usuarioOrigemId?: number;
  usuarioDestinoId?: number;
  setorOrigemId?: number;
  setorDestinoId?: number;
  instituicaoExternaId?: number;
  lido?: boolean;
  naoLidoSeteDias?: boolean;
  setores?: ITramitacaoProcesso[];
}

export class TramitacaoProcesso implements ITramitacaoProcesso {
  constructor(
    public id?: number,
    public processoId?: number,
    public usuarioOrigemId?: number,
    public usuarioDestinoId?: number,
    public setorOrigemId?: number,
    public setorDestinoId?: number,
    public instituicaoExternaId?: number,
    public lido?: boolean,
    public naoLidoSeteDias?: boolean,
    public setores?: ITramitacaoProcesso[]
  ) {}
}
