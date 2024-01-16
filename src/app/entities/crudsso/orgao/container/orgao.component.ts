import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { ConfirmationService } from 'primeng/api';

import { OrgaoService } from '../orgao.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IOrgao, Orgao } from 'src/app/shared/models/orgao.model';

@Component({
  selector: 'top-orgao',
  templateUrl: './orgao.component.html',
})
export class OrgaoComponent implements OnInit, OnDestroy {
  entidade: string = 'Órgãos';
  recipiente: string = 'Órgão';
  orgaos: Orgao[] = [];

  clienteId: number | undefined;

  inscricaoTabela!: Subscription;
  inscricaoConsultar!: Subscription;
  inscricaoAtualizar!: Subscription;
  inscricaoUsuarioLogado!: Subscription;
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
  selecionados: IOrgao[] = [];

  defaultColumns = [
    // {
    //   field: 'id',
    //   header: 'Id',
    //   type: 'numeric',
    //   dataMap: 'id',
    // },
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

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private orgaoService: OrgaoService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.buscarOrigem();
    this.carregarTabela$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoTabela) this.inscricaoTabela.unsubscribe();
    if (this.inscricaoConsultar) this.inscricaoConsultar.unsubscribe();
    if (this.inscricaoAtualizar) this.inscricaoAtualizar.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
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

  private buscarOrigem(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.clienteId = resposta.clienteId;
      });
  }

  private carregarTabela$(): void {
    this.carregando = true;
    this.inscricaoTabela = this.orgaoService.consultarOrgaos().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body!;
        this.orgaos = corpo.data || [];
        this.carregando = false;
      },
      error: (resposta: HttpErrorResponse) => {
        this.orgaos = [];
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', this.entidade);
        this.carregando = false;
      },
    });
  }

  protected confirmarExclusao(orgao: Orgao): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${orgao.sigla}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(orgao.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.orgaoService.excluirOrgao(id).subscribe({
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
    this.inscricaoConsultar = this.orgaoService.consultarOrgao(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const orgao: IOrgao = resposta.body?.data;
        this.mudarAtividade(orgao);
      },
      error: (resposta: HttpErrorResponse) => {
        const erro = resposta.error;
        this.exibirErro(erro.message, 'Buscar', this.recipiente);
      },
    });
  }

  private mudarAtividade(orgao: IOrgao): void {
    orgao.ativo = !orgao.ativo;
    orgao.clienteId = this.clienteId;
    delete orgao.cliente;
    this.inscricaoAtualizar = this.orgaoService
      .atualizarOrgao(orgao)
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
