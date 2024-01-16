import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { ConfirmationService } from 'primeng/api';

import { UnidadeService } from '../unidade.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUnidade } from 'src/app/shared/models/unidade.model';

@Component({
  selector: 'top-unidade',
  templateUrl: './unidade.component.html',
})
export class UnidadeComponent implements OnInit, OnDestroy {
  entidade = 'Unidades';
  recipiente = 'Unidade';
  unidades: IUnidade[] = [];

  inscricao!: Subscription;
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
  selecionados: IUnidade[] = [];

  defaultColumns = [
    {
      field: 'nome',
      header: 'Nome',
      type: 'text',
      dataMap: 'nome',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private exibirMensagemService: ExibirMensagemService,
    private unidadeService: UnidadeService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarTabela$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricao) this.inscricao.unsubscribe();
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
    this.inscricao = this.unidadeService.consultarUnidades().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.unidades = corpo!.data;
        this.carregando = false;
      },
      error: (resposta: HttpErrorResponse) => {
        this.unidades = [];
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', this.entidade);
        this.carregando = false;
      },
    });
  }

  protected confirmarExclusao(unidade: IUnidade): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${unidade.nome}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(unidade.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.unidadeService.excluirUnidade(id).subscribe({
      complete: () => {
        this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
          `${this.recipiente} excluído com sucesso.`,
        ]);
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

  protected onBlur(id: number): void {
    this.inscricao = this.unidadeService
      .consultarUnidade(id)
      .subscribe((resposta: HttpResponse<IEntidade>) => {
        const unidade: IUnidade = resposta.body?.data;
        unidade.ativo = !unidade.ativo;
        this.inscricaoAtualizar = this.unidadeService
          .atualizarUnidade(unidade)
          .subscribe(() => {});
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
