export interface IVariaveis {
  usuario?: string;
  setor?: string;
  orgao?: string;
  identificadorUsuario?: string;
}

export class Variaveis implements IVariaveis {
  constructor(
    public usuario?: string,
    public setor?: string,
    public orgao?: string,
    public identificadorUsuario?: string
  ) {}
}
