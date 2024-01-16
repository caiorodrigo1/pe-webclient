import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';

import { MunicipioService } from '../municipio.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IMunicipio, Municipio } from 'src/app/shared/models/municipio.model';

@Component({
  selector: 'top-municipio',
  templateUrl: './municipio.component.html',
})
export class MunicipioComponent implements OnInit, OnDestroy {
  entidade: string = 'Municípios';
  recipiente: string = 'Município';
  municipios: IMunicipio[] = [];

  inscricaoTabela!: Subscription;
  inscricaoExcluir!: Subscription;

  carregando: boolean = true;
  excluindo: boolean = false;

  cols!: any[];
  numCols = 0;

  page = 0;
  itemsPerPage = 10;
  totalRecords = 0;
  sort = ['id,asc'];
  globalFilter = '';

  _selectedColumns!: IDefaultColumn[];
  selecionados: IMunicipio[] = [];

  defaultColumns = [
    {
      field: 'nome',
      header: 'Nome',
      type: 'text',
      dataMap: 'nome',
    },
    {
      field: 'codigoIBGE',
      header: 'Código IBGE',
      type: 'text',
      dataMap: 'codigoIBGE',
    },
    {
      field: 'uf',
      header: 'UF',
      type: 'text',
      dataMap: 'uf',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private municipioService: MunicipioService,
    private exibirMensagemService: ExibirMensagemService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarTabela$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoTabela) this.inscricaoTabela.unsubscribe();
    if (this.inscricaoExcluir) this.inscricaoExcluir.unsubscribe();
  }

  private ajustarColunas(): void {
    this.cols = this.defaultColumns;
    this._selectedColumns = this.cols;
    this.checkCols(this._selectedColumns.length);
  }

  set selectedColumns(val: IDefaultColumn[]) {
    this._selectedColumns = this.cols.filter((col) =>
      val.some((vCol) => col.field === vCol.field)
    );
    this.checkCols(this._selectedColumns.length);
  }

  private checkCols(length: number): void {
    this.numCols = length;
  }

  protected globalFilterFields(): string[] {
    return this.defaultColumns.map((x) => x.dataMap);
  }

  private carregarTabela$(): void {
    this.carregando = true;
    this.inscricaoTabela = this.municipioService
      .consultarMunicipios()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.municipios = corpo!.data;
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.municipios = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });
  }

  protected confirmarExclusao(municipio: Municipio): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${municipio.nome}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(municipio.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.municipioService
      .excluirMunicipio(id)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            [`${this.recipiente} excluída com sucesso.`]
          );
          this.carregarTabela$();
          this.excluindo = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Excluir', this.recipiente);
          this.excluindo = false;
        },
      });
  }

  protected atualizarTela(table: Table): void {
    this.globalFilter = '';
    this.sort = ['id,asc'];
    table.reset();
  }

  protected linhaSelecionavel(event: any) {
    return true;
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
