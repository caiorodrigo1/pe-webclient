import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';

import { ProcessoService } from '../../services/processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { EventBus } from 'src/app/shared/services/event-bus.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { TipoVisualizacaoEnum } from 'src/app/shared/enums/tipo-visualizacao';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IProcesso,
  IProcessoJuntadaRequest,
} from 'src/app/shared/models/processo.model';

@Component({
  selector: 'app-processo-lista-modal',
  templateUrl: './processo-lista-modal.component.html',
})
export class ProcessoListaModalComponent implements OnInit, OnDestroy {
  recipiente: string = 'Processo';
  processo?: IProcesso;
  processos: IProcesso[] = [];
  setorId?: number;
  tipoJuntada?: string = 'Desconhecido';

  inscricaoBuscar!: Subscription;
  inscricaoJuntada!: Subscription;

  carregando: boolean = false;
  juntando: boolean = false;

  tabela: string = 'mudancaListaProcessoRecebido';

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
  selecionados: IProcesso[] = [];

  defaultColumns = [
    {
      field: 'numeroProcesso',
      header: 'Número',
      type: 'text',
      dataMap: 'numeroProcesso',
    },
    {
      field: 'tipo.nome',
      header: 'Tipo',
      type: 'text',
      dataMap: 'tipo.nome',
    },
    {
      field: 'assunto.nome',
      header: 'Assunto',
      type: 'text',
      dataMap: 'assunto.nome',
    },
    {
      field: 'dataCadastro',
      header: 'Data de Criação',
      type: 'datetime',
      dataMap: 'dataCadastro',
    },
    {
      field: 'nivelAcesso',
      header: 'Acesso',
      type: 'text',
      dataMap: 'nivelAcesso',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private processoService: ProcessoService,
    private exibirMensagemService: ExibirMensagemService,
    private confirmationService: ConfirmationService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
    this.carregarProcessos$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoBuscar) this.inscricaoBuscar.unsubscribe();
    if (this.inscricaoJuntada) this.inscricaoJuntada.unsubscribe();
  }

  private buscarDados(): void {
    this.processo = this.config.data.processo;
    this.setorId = this.config.data.setorId;
    this.tipoJuntada = this.config.data.tipo;
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

  private carregarProcessos$() {
    this.carregando = true;
    this.inscricaoBuscar = this.processoService
      .consultarLista_Tipo(TipoVisualizacaoEnum.RECEBIDO, this.setorId!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data.reverse() || [];
          this.processos = objeto.filter(
            (item: IProcesso) => item.id !== this.processo!.id
          );
          this.carregando = false;
          //console.log(this.processos);
        },
        error: (resposta: HttpErrorResponse) => {
          this.processos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Processos');
          this.carregando = false;
        },
      });
  }

  protected fechar(): void {
    this.ref.close();
  }

  protected confirmar(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja realizar a juntada destes processos?`,
      header: `Realizar Juntada por ${this.tipoJuntada}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.juntarProcesso(id),
    });
  }

  private juntarProcesso(id: number): void {
    this.juntando = true;

    if (this.tipoJuntada === 'Anexação') {
      const request: IProcessoJuntadaRequest = {
        processoPrincipalId: this.processo!.id!,
        processoAcessorioId: id,
      };
      this.chamarServico(this.processoService.juntadaProcessoAnexacao(request));
    } else if (this.tipoJuntada === 'Apensação') {
      const request: IProcessoJuntadaRequest = {
        processoPaiId: this.processo!.id!,
        processoFilhoId: id,
      };
      this.chamarServico(
        this.processoService.juntadaProcessoApensacao(request)
      );
    }
  }

  private chamarServico(resultado: Observable<HttpResponse<IEntidade>>) {
    this.inscricaoJuntada = resultado.subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        console.log('resposta: ', resposta);
        this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
          'Juntada Realizada Com Sucesso',
        ]);
        this.juntando = false;
        this.atualizarTabela();
        this.fechar();
      },
      error: (resposta: HttpErrorResponse) => {
        const codigo = resposta.error.message;
        this.exibirErro(codigo, 'Juntar', this.recipiente);
        this.juntando = false;
      },
    });
  }

  private atualizarTabela(): void {
    const tabelaEventMap = {
      '#criados': 'mudancaListaProcessoNovo',
      '#recebidos': 'mudancaListaProcessoRecebido',
      '#enviados': 'mudancaListaProcessoEnviado',
      '#favoritos': 'mudancaListaProcessoFavorito',
    };

    const tabela =
      (tabelaEventMap as Record<string, string>)[this.tabela] ||
      'mudancaListaProcessoRecebido';
    EventBus.getInstance().dispatch<any>(tabela);
  }

  protected atualizarTela(table: Table): void {
    this.globalFilter = '';
    this.sort = ['id,asc'];
    table.reset();
  }

  protected globalFilterFields(): string[] {
    return this.defaultColumns.map((x) => x.dataMap);
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

    this.carregarProcessos$();
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
