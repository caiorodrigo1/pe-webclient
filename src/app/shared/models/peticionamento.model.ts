import { ICliente } from './cliente.model';
import { IOrgao } from './orgao.model';

export interface IPeticionamento {
  id?: number;
  protocolo?: string;
  solicitante?: string;
  solicitacao?: string;
  resposta?: string;
  concluido?: boolean;
  dataCadastro?: string;
  dataAtualizacao?: string;
  documento?: string;
  email?: string;
  tipoDocumento?: string;
  anexoPedido?: string;
  anexoResposta?: string;
  orgaoId?: number;
  orgao?: IOrgao;
}

export class Peticionamento implements IPeticionamento {
  constructor(
    public id?: number,
    public protocolo?: string,
    public solicitante?: string,
    public solicitacao?: string,
    public resposta?: string,
    public concluido?: boolean,
    public dataCadastro?: string,
    public dataAtualizacao?: string,
    public documento?: string,
    public email?: string,
    public tipoDocumento?: string,
    public anexoPedido?: string,
    public anexoResposta?: string,
    public orgaoId?: number,
    public orgao?: IOrgao
  ) {}
}

export interface IConsultaPublica {
  cliente: ICliente | null;
  orgao: IOrgao | null;
  protocolo: string;
}

export interface IPeticionamentoRequest {
  tenant?: string;
  orgaoDestinoId?: number;
  solicitante?: string;
  email?: string;
  tipoDocumentacao?: string;
  documento?: string;
  solicitacao?: string;
  telefone?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  dataNascimento?: string;
}
