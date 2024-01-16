export interface ITelefone {
  principal?: string;
  adicional?: string;
}

export class Telefone implements ITelefone {
  constructor(public principal?: string, public adicional?: string) {}
}
