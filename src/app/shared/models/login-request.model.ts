import { ISetor } from './setor.model';

export class LoginRequest {
  constructor(
    public cpf: string,
    public senha: string,
    public clienteId: number,
    public rememberMe: boolean
  ) {}
}

export class RefreshRequest {
  constructor(
    public metadata: {
      identificadorOrgao: string;
      setores: ISetor[];
    },
    public refreshToken: string
  ) {}
}
