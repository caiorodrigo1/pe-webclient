import { ITotalizador } from './totalizador.model';

interface IEvolucoes {
  mes?: number;
  ano?: number;
  mesano?: string;
  recebidos: number;
  enviados: number;
}

export interface IDashboard {
  evolucaoProcessos?: IEvolucoes[];
  totalizadores?: ITotalizador;
}

export class Dashboard implements IDashboard {
  constructor(
    public evolucaoProcessos?: IEvolucoes[],
    public totalizadores?: ITotalizador
  ) {}
}
