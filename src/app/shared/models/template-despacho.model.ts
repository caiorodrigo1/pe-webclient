export interface ITemplateDespacho {
  id?: number;
  nome?: string;
  template?: string;
}

export class TemplateDespacho implements ITemplateDespacho {
  constructor(
    public id?: number,
    public nome?: string,
    public template?: string
  ) {}
}
