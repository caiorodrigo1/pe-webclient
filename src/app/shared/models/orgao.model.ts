import { ICliente } from './cliente.model';
import { ITelefone } from './telefone.model';
import { IEndereco } from './endereco.model';

export interface IOrgao {
  id?: number;
  clienteId?: number;
  cliente?: ICliente;
  sigla?: string;
  identificador?: string;
  identificadorOrgao?: string;
  descricao?: string;
  descricaoCompleta?: string;
  tenant?: string;
  ativo?: boolean;
  cep?: string;
  endereco?: IEndereco;
  telefone?: ITelefone;
}

export class Orgao implements IOrgao {
  constructor(
    public id?: number,
    public clienteId?: number,
    public cliente?: ICliente,
    public sigla?: string,
    public identificador?: string,
    public identificadorOrgao?: string,
    public descricao?: string,
    public descricaoCompleta?: string,
    public tenant?: string,
    public ativo?: boolean,
    public cep?: string,
    public endereco?: IEndereco,
    public telefone?: ITelefone
  ) {}
}
