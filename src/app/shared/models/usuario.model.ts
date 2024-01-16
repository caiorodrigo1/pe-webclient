import { ISetor } from './setor.model';
import { IOrgao } from './orgao.model';

export interface IUsuario {
  id?: number;
  clienteId?: number;
  cpf?: string;
  email?: string;
  senha?: string;
  identificador?: string;
  nome?: string;
  setores?: ISetor[];
  orgao?: IOrgao[];
  tenant?: string;
  ativo?: boolean;
}

export class Usuario implements IUsuario {
  constructor(
    public id?: number,
    public clienteId?: number,
    public cpf?: string,
    public email?: string,
    public senha?: string,
    public identificador?: string,
    public nome?: string,
    public setores?: ISetor[],
    public orgao?: IOrgao[],
    public tenant?: string,
    public ativo?: boolean
  ) {}
}
