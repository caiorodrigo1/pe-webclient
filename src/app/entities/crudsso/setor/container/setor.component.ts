import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Table } from 'primeng/table/table';
import { LazyLoadEvent } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { SetorService } from '../setor.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ISetor, Setor } from 'src/app/shared/models/setor.model';
import { TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'top-setor',
  templateUrl: './setor.component.html',
})
export class SetorComponent implements OnInit, OnDestroy {
  entidade: string = 'Setores';
  recipiente: string = 'Setor';
  setores: ISetor[] = [];

  inscricaoSetores!: Subscription;
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
  globalFilter!: '';

  event: LazyLoadEvent = {
    first: 0,
    rows: 10,
    sortOrder: 1,
    filters: {},
    globalFilter: null,
  };

  _selectedColumns!: IDefaultColumn[];
  selecionados: ISetor[] = [];

  defaultColumns = [
    {
      field: 'sigla',
      header: 'Sigla',
      type: 'text',
      dataMap: 'sigla',
    },
    {
      field: 'descricao',
      header: 'Descricao',
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

  constructor(
    private setorService: SetorService,
    private exibirMensagemService: ExibirMensagemService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarTabela$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoSetores) this.inscricaoSetores.unsubscribe();
    if (this.inscricaoAtualizar) this.inscricaoAtualizar.unsubscribe();
    if (this.inscricaoExcluir) this.inscricaoExcluir.unsubscribe();
  }

  private ajustarColunas(): void {
    this.cols = this.defaultColumns;
    this._selectedColumns = this.cols;
    this.checkCols(this._selectedColumns.length);
  }

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
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
    this.inscricaoSetores = this.setorService.consultarSetores().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.setores = corpo!.data || [];
        this.carregando = false;
      },
      error: (resposta: HttpErrorResponse) => {
        this.setores = [];
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', this.entidade);
        this.carregando = false;
      },
    });
  }

  protected confirmarExclusao(setor: Setor): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${setor.sigla}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(setor.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.setorService.excluirSetor(id).subscribe({
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

  protected onBlur(id: number): void {
    this.inscricaoSetores = this.setorService.consultarSetor(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const setor: ISetor = resposta.body?.data;
        this.mudarAtividade(setor);
      },
      error: (resposta: HttpErrorResponse) => {
        const erro = resposta.error;
        this.exibirErro(erro.message, 'Buscar', this.recipiente);
      },
    });
  }

  private mudarAtividade(setor: ISetor): void {
    setor.ativo = !setor.ativo;
    delete setor.nomeUnidade;
    this.inscricaoAtualizar = this.setorService
      .atualizarSetor(setor)
      .subscribe({
        complete: () => {},
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Atualizar', this.recipiente);
        },
      });
  }

  protected exibirErro(codigo: string, acao: string, entidade: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${entidade}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
