export interface IAuditoria {
  id?: number;
  casoDeUso?: string;
  usuario?: string;
  dataCadastro?: string;
  conteudo?: string;
}

export class Auditoria implements IAuditoria {
  constructor(
    public id?: number,
    public casoDeUso?: string,
    public usuario?: string,
    public dataCadastro?: string,
    public conteudo?: string
  ) {}
}
