export interface IUsuarioToken {
  name: string;
  nbf: number;
  exp: number;
  iat: number;
}

export class Account {
  constructor(
    public id?: number,
    public cpf?: string,
    public nome?: string,
    public senha?: string,
    public email?: string,
    public bloqueado?: boolean,
    public ultimoLogin?: string
  ) {}
}
