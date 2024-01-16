import { IOrgao } from './orgao.model';
import { IPapeisUsuario } from './papeis-usuario.model';
import { ISetor } from './setor.model';
import { IUsuario } from './usuario.model';

export interface IPermissao {
  id?: number;
  usuarioId?: number;
  papelId?: number;
  usuarioCoordenador?: boolean;
  ativo?: boolean;
  setorId?: number;
  setor?: ISetor;
  papel?: IPapeisUsuario;
  usuario?: IUsuario;
  orgao?: IOrgao;
}

export class Permissao implements IPermissao {
  constructor(
    public id?: number,
    public usuarioId?: number,
    public setorId?: number,
    public papelId?: number,
    public usuarioCoordenador?: boolean,
    public ativo?: boolean,
    public setor?: ISetor,
    public papel?: IPapeisUsuario,
    public usuario?: IUsuario,
    public orgao?: IOrgao
  ) {}
}
