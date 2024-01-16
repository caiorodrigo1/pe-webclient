import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Table } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { ConfirmationService } from 'primeng/api';

import { HipoteseLegalService } from '../hipotese-legal.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IHipoteseLegal,
  HipoteseLegal,
} from 'src/app/shared/models/hipotese-legal.model';

@Component({
  selector: 'top-hipotese-legal',
  templateUrl: './hipotese-legal.component.html',
})
export class HipoteseLegalComponent implements OnInit, OnDestroy {
  entidade: string = 'Hipóteses Legais (LGPD)';
  recipiente: string = 'Hipótese Legal (LGPD)';
  hipotesesLegais: IHipoteseLegal[] = [];

  inscricaoTabela!: Subscription;
  inscricaoConsultar!: Subscription;
  inscricaoAtualizar!: Subscription;
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
  selecionados: IHipoteseLegal[] = [];

  defaultColumns: IDefaultColumn[] = [
    {
      field: 'descricao',
      header: 'Descrição',
      type: 'text',
      dataMap: 'descricao',
    },
    {
      field: 'ativo',
      header: 'Ativo',
      type: 'boolean',
      dataMap: 'ativo',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private hipoteseLegalService: HipoteseLegalService,
    private exibirMensagemService: ExibirMensagemService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarTabela$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoTabela) this.inscricaoTabela.unsubscribe();
    if (this.inscricaoConsultar) this.inscricaoConsultar.unsubscribe();
    if (this.inscricaoAtualizar) this.inscricaoAtualizar.unsubscribe();
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

    this.inscricaoTabela = this.hipoteseLegalService
      .consultarHipotesesLegais()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.hipotesesLegais = corpo!.data;
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.hipotesesLegais = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });
  }

  protected confirmarExclusao(hipoteseLegal: HipoteseLegal): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${hipoteseLegal.descricao}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(hipoteseLegal.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.hipoteseLegalService
      .excluirHipoteseLegal(id)
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

  protected lazyLoad(event: any): void {
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

  protected onBlur(id: number): void {
    this.inscricaoConsultar = this.hipoteseLegalService
      .consultarHipoteseLegal(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const hipoteseLegal: IHipoteseLegal = resposta.body?.data;
          this.mudarAtividade(hipoteseLegal);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro = resposta.error;
          this.exibirErro(erro.message, 'Buscar', this.recipiente);
        },
      });
  }

  private mudarAtividade(hipoteseLegal: IHipoteseLegal): void {
    hipoteseLegal.ativo = !hipoteseLegal.ativo;
    this.inscricaoAtualizar = this.hipoteseLegalService
      .atualizarHipoteseLegal(hipoteseLegal)
      .subscribe({
        complete: () => {},
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Atualizar', this.recipiente);
        },
      });
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
