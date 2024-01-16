import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { ConfirmationService } from 'primeng/api';

import { InstituicaoExternaService } from '../instituicao-externa.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

import {
  IInstituicaoExterna,
  InstituicaoExterna,
} from 'src/app/shared/models/instituicao-externa.model';

@Component({
  selector: 'top-instituicao-externa',
  templateUrl: './instituicao-externa.component.html',
})
export class InstituicaoExternaComponent implements OnInit, OnDestroy {
  entidade: string = 'Instituições Externas';
  recipiente: string = 'Instituição Externa';
  instituicoesExternas: IInstituicaoExterna[] = [];

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

  event: LazyLoadEvent = {
    first: 0,
    rows: 10,
    sortOrder: 1,
    filters: {},
    globalFilter: null,
  };

  _selectedColumns!: IDefaultColumn[];
  selecionados: IInstituicaoExterna[] = [];

  defaultColumns = [
    {
      field: 'nome',
      header: 'Nome',
      type: 'text',
      dataMap: 'nome',
    },
    {
      field: 'sigla',
      header: 'Sigla',
      type: 'text',
      dataMap: 'sigla',
    },
    {
      field: 'responsavel',
      header: 'Responsável',
      type: 'text',
      dataMap: 'responsavel',
    },
    {
      field: 'cidade',
      header: 'Cidade',
      type: 'text',
      dataMap: 'cidade',
    },
    {
      field: 'estado',
      header: 'UF',
      type: 'estado',
      dataMap: 'estado',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private instituicaoExternaService: InstituicaoExternaService,
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

    this.inscricaoTabela = this.instituicaoExternaService
      .consultarInstituicoesExternas()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.instituicoesExternas = corpo!.data;
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.instituicoesExternas = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });
  }

  protected confirmarExclusao(instituicaoExterna: InstituicaoExterna): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${instituicaoExterna.nome}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(instituicaoExterna.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.instituicaoExternaService
      .excluirInstituicaoExterna(id)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            [`${this.recipiente} excluído com sucesso.`]
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

  protected lazyLoad(event: TableLazyLoadEvent): void {
    this.event = JSON.parse(JSON.stringify(event));
    if (this.event.sortField)
      this.sort = [
        `${this.event.sortField},${
          this.event.sortOrder === 1 ? 'asc' : 'desc'
        }`,
      ];

    this.itemsPerPage = this.event.rows || 10;
    this.page = this.event.first! / this.itemsPerPage;

    this.carregarTabela$();
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
