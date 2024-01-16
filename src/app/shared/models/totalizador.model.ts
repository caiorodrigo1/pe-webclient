export interface ITotalizador {
  naoLido?: number;
  pendenteSetor?: number;
  rascunhos?: number;
  criados?: number;
  enviados?: number;
  favoritos?: number;
  recebidos?: number;
  tramitados?: number;
  naoTramitados?: number;
  intituicoesExternas?: number;
  total?: number;
}

export class Totalizador implements ITotalizador {
  constructor(
    public naoLido?: number,
    public pendenteSetor?: number,
    public rascunhos?: number,
    public criados?: number,
    public enviados?: number,
    public favoritos?: number,
    public recebidos?: number,
    public _tramitados?: number,
    public _naoTramitados?: number,
    public intituicoesExternas?: number,
    public _total?: number
  ) {}

  get naoTramitados(): number {
    return (this.rascunhos || 0) + (this.criados || 0);
  }

  set naoTramitados(value: number) {
    this._tramitados = value;
  }

  get tramitados(): number {
    return (this.enviados || 0) + (this.recebidos || 0);
  }

  set tramitados(value: number) {
    this._tramitados = value;
  }

  get total(): number {
    return (
      (this.rascunhos || 0) +
      (this.criados || 0) +
      (this.enviados || 0) +
      (this.recebidos || 0) +
      (this.favoritos || 0)
    );
  }

  set total(value: number) {
    this._total = value;
  }
}
