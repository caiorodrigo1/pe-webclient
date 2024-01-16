import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { ConfirmationService } from 'primeng/api';

import { PermissaoService } from '../permissao.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { IPermissao, Permissao } from 'src/app/shared/models/permissao.model';

@Component({
  selector: 'top-permissao',
  templateUrl: './permissao.component.html',
})
export class PermissaoComponent implements OnInit, OnDestroy {
  entidade: string = 'Permissões';
  recipiente: string = 'Permissão';
  permissoes: IPermissao[] = [];
  setorId!: number;

  inscricaoUsuarioLogado!: Subscription;
  inscricaoTabela!: Subscription;
  inscricaoConsultarCoodenador!: Subscription;
  inscricaoConsultarAtivo!: Subscription;
  inscricaoAtualizarCoordenador!: Subscription;
  inscricaoAtualizarAtivo!: Subscription;
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
  selecionados: IPermissao[] = [];

  defaultColumns = [
    {
      field: 'usuario.nome',
      header: 'Usuário',
      type: 'text',
      dataMap: 'usuario.nome',
    },
    {
      field: 'setor.sigla',
      header: 'Setor',
      type: 'text',
      dataMap: 'setor.sigla',
    },
    {
      field: 'papel.nome',
      header: 'Papel Usuário',
      type: 'text',
      dataMap: 'papel.nome',
    },
    {
      field: 'usuarioCoordenador',
      header: 'Usuario Coordenador',
      type: 'boolean',
      dataMap: 'usuarioCoordenador',
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
    private exibirMensagemService: ExibirMensagemService,
    private usuarioLogadoService: UsuarioLogadoService,
    private permissaoService: PermissaoService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.buscarOrigens$();
    this.ajustarColunas();
    this.carregarTabela$();
  }

  ngOnDestroy(): void {
    this.unsubscribeSeExistir(
      this.inscricaoUsuarioLogado,
      this.inscricaoTabela,
      this.inscricaoConsultarCoodenador,
      this.inscricaoConsultarAtivo,
      this.inscricaoAtualizarCoordenador,
      this.inscricaoAtualizarAtivo,
      this.inscricaoExcluir
    );
  }

  private unsubscribeSeExistir(...subscriptions: Subscription[]): void {
    subscriptions.forEach((subscription) => {
      if (subscription) subscription.unsubscribe();
    });
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

  private buscarOrigens$() {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((usuarioLogado: IUsuarioLogado) => {
        this.setorId = usuarioLogado.setor!.id!;
      });
  }

  private carregarTabela$(): void {
    this.carregando = true;

    this.inscricaoTabela = this.permissaoService
      .consultarListaPermissoes(this.setorId)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.permissoes = corpo!.data || [];
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.permissoes = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });
  }

  protected confirmarExclusao(permissao: Permissao): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a ${this.recipiente} de ${
        permissao.usuario!.nome
      } em ${permissao.setor!.sigla}?`,
      header: `Excluir ${this.recipiente}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.excluir(permissao.id!),
    });
  }

  private excluir(id: number): void {
    this.excluindo = true;

    this.inscricaoExcluir = this.permissaoService
      .excluirPermissao(id)
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

  protected onBlurAtivo(id: number): void {
    this.inscricaoConsultarAtivo = this.permissaoService
      .consultarPermissao(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const permissao: IPermissao = resposta.body?.data;
          this.mudarAtividade(permissao);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.recipiente);
        },
      });
  }

  private mudarAtividade(permissao: IPermissao): void {
    permissao.ativo = !permissao.ativo;
    this.inscricaoAtualizarAtivo = this.permissaoService
      .atualizarPermissao(permissao)
      .subscribe({
        complete: () => {},
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Atualizar', this.recipiente);
        },
      });
  }

  protected onBlurUsuarioCoordenador(id: number): void {
    this.inscricaoConsultarCoodenador = this.permissaoService
      .consultarPermissao(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const permissao: IPermissao = resposta.body?.data;
          this.mudarPapel(permissao);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.recipiente);
        },
      });
  }

  private mudarPapel(permissao: IPermissao): void {
    permissao.usuarioCoordenador = !permissao.usuarioCoordenador;
    this.inscricaoAtualizarCoordenador = this.permissaoService
      .atualizarPermissao(permissao)
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
