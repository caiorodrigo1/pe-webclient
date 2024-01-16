//import { Moment } from 'moment';
//import { StatusAcessoEnum } from '../enumerations/status-acesso.enum';
import { ISetor } from './setor.model';
import { IOrgao } from './orgao.model';

export interface IUsuarioLogado {
  id?: number;
  nome?: string;
  cpf?: string;
  email?: string;
  clienteId?: number;
  nomeCliente?: string;
  cliente?: string;
  logo?: string;
  identificadorCliente?: string;
  identificadorUsuario?: string;
  setor?: ISetor;
  setores?: ISetor[];
  orgao?: IOrgao;
  orgaos?: IOrgao[];
  token?: string;
  refreshToken?: string;
  ativo?: boolean;
}

// senha?: string;
// email?: string;
// ultimoLogin?: Moment;
// statusAcesso?: StatusAcessoEnum;

export class UsuarioLogado implements IUsuarioLogado {
  constructor(
    public id?: number,
    public nome?: string,
    public cpf?: string,
    public email?: string,
    public clienteId?: number,
    public nomeCliente?: string,
    public cliente?: string,
    public logo?: string,
    public identificadorCliente?: string,
    public identificadorUsuario?: string,
    public setor?: ISetor,
    public setores?: ISetor[],
    public orgao?: IOrgao,
    public orgaos?: IOrgao[],
    public token?: string,
    public refreshToken?: string,
    public ativo?: boolean
  ) {}
}
//public senha?: string,
//  public email?: string,
//  public ultimoLogin?: Moment,
// public statusAcesso?: StatusAcessoEnum,
//
