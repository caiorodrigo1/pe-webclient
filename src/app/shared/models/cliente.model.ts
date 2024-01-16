import { IMunicipio } from './municipio.model';
import { IEndereco } from './endereco.model';
import { ITelefone } from './telefone.model';

export interface ICliente {
  id?: number;
  nome?: string;
  logo?: string;
  municipioId?: number;
  municipio?: IMunicipio;
  cep?: string;
  cnpj?: string;
  codigo?: string;
  ativo?: boolean;
  endereco?: IEndereco;
  telefone?: ITelefone;
  tenant?: string;
}

export class Cliente implements ICliente {
  constructor(
    public id?: number,
    public nome?: string,
    public logo?: string,
    public municipioId?: number,
    public municipio?: IMunicipio,
    public cep?: string,
    public cnpj?: string,
    public codigo?: string,
    public ativo?: boolean,
    public endereco?: IEndereco,
    public telefone?: ITelefone,
    public tenant?: string
  ) {}
}
