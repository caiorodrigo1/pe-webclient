import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LazyLoadEvent } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';

import { ProcessoService } from '../../services/processo.service';
import { TotalizadorService } from 'src/app/shared/services/totalizador.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { ValidaComponentService } from 'src/app/shared/services/valida-component.service';
import { DataService } from 'src/app/shared/services/data.service';
import { EventBus } from 'src/app/shared/services/event-bus.service';
import { TipoVisualizacaoEnum } from 'src/app/shared/enums/tipo-visualizacao';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { ProcessoTramitacaoComponent } from '../../components/processo-tramitar/processo-tramitacao.component';
import { ProcessoDistribuirComponent } from '../../components/processo-distribuir/processo-distribuir.component';
import { ProcessoListaModalComponent } from '../../components/processo-lista-modal/processo-lista-modal.component';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import {
  ITotalizador,
  Totalizador,
} from 'src/app/shared/models/totalizador.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import {
  IProcesso,
  IProcessoRequest,
} from 'src/app/shared/models/processo.model';
import { ProcessoArquivarComponent } from '../../components/processo-arquivar/processo-arquivar.component';

@Component({
  selector: 'top-processo',
  templateUrl: './processo.component.html',
  styleUrls: ['./processo.component.scss'],
})
export class ProcessoComponent implements OnInit, OnDestroy {
  entidade: string = 'Processos';
  recipiente: string = 'Processo';

  ref: DynamicDialogRef | undefined;

  rota: string = '';
  tabelaInicial: string = '';
  tabelaAtual: string = '';

  processo!: IProcesso;
  processos: IProcesso[] = [];
  totalizador!: ITotalizador;

  setorId!: number;
  contadorEnviados!: number;
  contadorRecebidos!: number;
  contadorCriados!: number;
  contadorRascunhos!: number;
  contadorFavoritos!: number;
  contadorInstituicoes!: number;
  totalProcessos!: number;

  inscricaoProcessos!: Subscription;
  inscricaoVisualizar!: Subscription;
  inscricaoTotalizador!: Subscription;
  inscricaoUsuarioLogado!: Subscription;
  inscricaoExcluir!: Subscription;
  inscricaoFavoritar!: Subscription;
  inscricaoDesfavoritar!: Subscription;
  inscricaoMarcarLido!: Subscription;
  inscricaoDesjuntar!: Subscription;

  carregando: boolean = true;
  rascunho: boolean = false;
  desjuntando: boolean = false;
  busRegistrado: boolean = false;

  tabelas = [
    '#rascunhos',
    '#criados',
    '#recebidos',
    '#enviados',
    '#instituicoes-externas',
    '#distribuidos-recebidos',
    '#distribuidos-enviados',
    '#favoritos',
    '#arquivados',
  ];

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
      field: 'id',
      header: 'ID',
      type: 'text',
      dataMap: 'id',
    },
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
      field: 'tramitacao.dataHoraTramitacao',
      header: 'Data Envio',
      type: 'datetime',
      dataMap: 'tramitacao.dataHoraTramitacao',
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
    {
      field: 'instituicaoExterna',
      header: 'Instituição Externa',
      type: 'text',
      dataMap: 'tramitacao.instituicaoExterna.nome',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private processoService: ProcessoService,
    private totalizadorService: TotalizadorService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private validaComponentService: ValidaComponentService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.buscarOrigem();
    this.ajustarPelaRotaAtiva();
    this.registrarMudancaProcesso();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    this.unsubscribeSeExistir(
      this.inscricaoProcessos,
      this.inscricaoTotalizador,
      this.inscricaoVisualizar,
      this.inscricaoUsuarioLogado,
      this.inscricaoExcluir,
      this.inscricaoFavoritar,
      this.inscricaoDesfavoritar,
      this.inscricaoExcluir,
      this.inscricaoMarcarLido,
      this.inscricaoDesjuntar
    );
  }

  private unsubscribeSeExistir(...subscriptions: Subscription[]): void {
    subscriptions.forEach((subscription) => {
      if (subscription) subscription.unsubscribe();
    });
  }

  private buscarOrigem(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((usuarioLogado: IUsuarioLogado) => {
        this.setorId = usuarioLogado.setor!.id!;
      });
  }

  private ajustarPelaRotaAtiva(): void {
    const mapeamento = {
      entrada: this.tabelas[2],
      'nao-tramitados': this.tabelas[1], // não tramitados abrindo CRIADOS como principal
      rascunhos: this.tabelas[0], // abre só rascunhos
      criados: this.tabelas[1], // abre só criados
      tramitados: this.tabelas[2], // tramitados abrindo RECEBIDOS como principal
      enviados: this.tabelas[3], // abre só enviados
      recebidos: this.tabelas[2], // abre só recebidos
      'instituicoes-externas': this.tabelas[4], // instituições externas
      distribuidos: this.tabelas[5], // distribuidos-recebidos abrindo DESTRIBUIDOS RECEBIDOS como principal
      'distribuidos-recebidos': this.tabelas[5], // abre só DESTRIBUIDOS RECEBIDOS
      'distribuidos-enviados': this.tabelas[6], // abre só DESTRIBUIDOS ENVIADOS
      favoritos: this.tabelas[7], // abre só favoritos
      arquivados: this.tabelas[8], // abre só arquivados
    };

    this.activatedRoute.paramMap.subscribe((valor) => {
      const rota = valor.get('tipo');

      this.rota = rota && mapeamento.hasOwnProperty(rota) ? rota : 'todos';
      this.tabelaInicial =
        (mapeamento as Record<string, string>)[this.rota] || this.tabelas[1]; // valor padrão: criados
      this.tabelaAtual = this.tabelaInicial;
      this.rascunho = false;

      this.setarTabelaInicial();
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

  protected buscarExibicaoAtual(): string {
    const mapeamento = {
      'nao-tramitados': 'Processos Não Tramitados',
      rascunhos: 'Rascunhos de Processos',
      criados: 'Processos Criados',
      tramitados: 'Processos Tramitados',
      enviados: 'Processos Enviados',
      recebidos: 'Processos Recebidos',
      'instituicoes-externas': 'Processos em Instituições Externas',
      distribuidos: 'Processos Distribuídos',
      'distribuidos-recebidos': 'Processos Distribuídos Recebidos',
      'distribuidos-enviados': 'Processos Distribuídos Enviados',
      favoritos: 'Processos Favoritos',
      arquivados: 'Processos Arquivados',
    };

    const atual =
      (mapeamento as Record<string, string>)[this.rota] || 'Todos os Processo';
    return atual;
  }

  private setarTabelaInicial(): void {
    this.limparAbas();
    const tab = this.elementRef.nativeElement.querySelector(this.tabelaInicial);
    if (!tab.classList.contains('active')) tab.classList.add('active');

    if (this.rota == 'arquivados') {
      this.carregarArquivados$();
    } else if (this.rota == 'favoritos') {
      this.carregarFavoritos$();
    } else if (this.rota == 'rascunhos') {
      this.carregarRascunhos$(); // abre só rascunhos
    } else if (this.rota == 'entrada') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.RECEBIDO);
    } else if (this.rota == 'criado') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.CRIADO); // abre só criados
    } else if (this.rota == 'tramitados') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.RECEBIDO);
    } else if (this.rota == 'enviados') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.ENVIADO);
    } else if (this.rota == 'recebidos') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.RECEBIDO); // abre só recebidos
    } else if (this.rota == 'instituicoes-externas') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.INSTITUICAO_EXTERNA);
    } else if (this.rota == 'distribuidos') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.DISTRIBUICAO_RECEBIDO);
    } else if (this.rota == 'distribuidos-recebidos') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.DISTRIBUICAO_RECEBIDO); // abre só distribuidos recebidos
    } else if (this.rota == 'distribuidos-enviados') {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.DISTRIBUICAO_ENVIADO); // abre só distribuidos enviados
    } else {
      this.carregarVisualizacao$(TipoVisualizacaoEnum.CRIADO);
    }
    this.buscarTotalizadores();
  }

  private buscarTotalizadores(): void {
    this.totalizador = new Totalizador();
    this.inscricaoTotalizador = this.totalizadorService
      .lerTotalizador()
      .subscribe((resposta) => {
        this.totalizador = resposta;
      });
  }

  private atualizarTotalizadores(): void {
    this.inscricaoTotalizador = this.totalizadorService
      .consultarTotalizadores()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const res: any = resposta.body;
          this.totalizador.criados = res.data.criados;
          this.totalizador.enviados = res.data.enviados;
          this.totalizador.recebidos = res.data.recebidos;
          this.totalizador.rascunhos = res.data.rascunhos;
          this.totalizador.favoritos = res.data.favoritos;
          this.totalizadorService.escreverTotalizador(this.totalizador);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Totalizadores');
        },
      });
  }

  private limparAbas(): void {
    for (let i = 0; i < this.tabelas.length; i++) {
      const tab = this.elementRef.nativeElement.querySelector(this.tabelas[i]);
      tab.classList.remove('active');
    }
  }

  private carregarVisualizacao$(tipo: number): void {
    this.carregando = true;
    this.inscricaoProcessos = this.processoService
      .consultarLista_Tipo(tipo, this.setorId)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data.reverse() || [];
          this.atualizarTotalizadores();
          this.processos = objeto;
          this.carregando = false;
          //console.log('processos:', this.processos);
        },
        error: (resposta: HttpErrorResponse) => {
          this.processos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });
  }

  private carregarFavoritos$(): void {
    this.carregando = true;
    this.inscricaoProcessos = this.processoService
      .consultarFavoritos()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data.reverse() || [];
          this.atualizarTotalizadores();
          //console.log(objeto);
          this.processos = objeto.map(
            (item: { id: number; processo: IProcesso }) => {
              const processoFavorito: IProcesso = item.processo;
              processoFavorito.favorito = true;
              processoFavorito.favoritoId = item.id;
              return processoFavorito;
            }
          );
          //console.log(this.processos);
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.processos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(
            erro.message!,
            'Buscar',
            `${this.entidade} Favoritos`
          );
          this.carregando = false;
        },
      });
  }

  private carregarArquivados$(): void {
    this.carregando = true;
    this.inscricaoProcessos = this.processoService
      .consultarArquivados(this.setorId)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data.reverse() || [];
          this.processos = objeto;
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.processos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Processos Arquivados');
          this.carregando = false;
        },
      });
  }

  private carregarRascunhos$(): void {
    this.rascunho = true;
    this.carregando = true;
    this.inscricaoProcessos = this.processoService
      .consultarRascunhos()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data.reverse() || [];
          this.atualizarTotalizadores();
          this.processos = objeto;
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.processos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Rascunhos');
          this.carregando = false;
        },
      });
  }

  protected registrarMudancaProcesso(): void {
    if (!this.busRegistrado) {
      EventBus.getInstance().register('mudancaListaRascunhoProcesso', () => {
        this.carregarRascunhos$();
      });
      EventBus.getInstance().register('mudancaListaProcessoNovo', () => {
        this.carregarVisualizacao$(TipoVisualizacaoEnum.CRIADO);
      });
      EventBus.getInstance().register('mudancaListaProcessoRecebido', () => {
        this.carregarVisualizacao$(TipoVisualizacaoEnum.RECEBIDO);
      });
      EventBus.getInstance().register('mudancaListaProcessoEnviado', () => {
        this.carregarVisualizacao$(TipoVisualizacaoEnum.ENVIADO);
      });
      EventBus.getInstance().register(
        'mudancaListaProcessoIntituicaoExterna',
        () => {
          this.carregarVisualizacao$(TipoVisualizacaoEnum.INSTITUICAO_EXTERNA);
        }
      );
      EventBus.getInstance().register(
        'mudancaListaProcessoDistribuidoRecebido',
        () => {
          this.carregarVisualizacao$(
            TipoVisualizacaoEnum.DISTRIBUICAO_RECEBIDO
          );
        }
      );
      EventBus.getInstance().register(
        'mudancaListaProcessoDistribuidoEnviado',
        () => {
          this.carregarVisualizacao$(TipoVisualizacaoEnum.DISTRIBUICAO_ENVIADO);
        }
      );
      EventBus.getInstance().register('mudancaListaProcessoFavorito', () => {
        this.carregarFavoritos$();
      });
    }
    this.busRegistrado = true;
  }

  protected mudarTabela(tabela: string): void {
    this.rascunho = false;
    this.tabelaAtual = tabela;

    switch (tabela) {
      case this.tabelas[0]:
        this.carregarRascunhos$();
        break;
      case this.tabelas[1]:
        this.carregarVisualizacao$(TipoVisualizacaoEnum.CRIADO);
        break;
      case this.tabelas[2]:
        this.carregarVisualizacao$(TipoVisualizacaoEnum.RECEBIDO);
        break;
      case this.tabelas[3]:
        this.carregarVisualizacao$(TipoVisualizacaoEnum.ENVIADO);
        break;
      case this.tabelas[4]:
        this.carregarVisualizacao$(TipoVisualizacaoEnum.INSTITUICAO_EXTERNA);
        break;
      case this.tabelas[5]:
        this.carregarVisualizacao$(TipoVisualizacaoEnum.DISTRIBUICAO_RECEBIDO);
        break;
      case this.tabelas[6]:
        this.carregarVisualizacao$(TipoVisualizacaoEnum.DISTRIBUICAO_ENVIADO);
        break;
      case this.tabelas[7]:
        this.carregarFavoritos$();
        break;
      case this.tabelas[8]:
        this.carregarArquivados$();
        break;
      default:
        this.processos = [];
        break;
    }
  }

  protected editar(processo: IProcesso): void {
    this.inscricaoVisualizar = this.processoService
      .consultarProcesso(processo.id!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data || [];
          this.validaComponentService.liberar(true);
          this.dataService.guardarObjeto({
            recipiente: this.recipiente,
            rota: `processo/${this.rota}`,
            objeto: objeto,
          });
          this.router.navigate([`processo/${this.rota}/criar`]);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.recipiente);
        },
      });
  }

  protected excluirRascunho(id: number): void {
    this.inscricaoExcluir = this.processoService.excluirRascunho(id).subscribe({
      complete: () => {
        this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
          `Rascunho de ${this.recipiente} excluído com sucesso.`,
        ]);
        EventBus.getInstance().dispatch<any>('mudancaListaRascunhoProcesso');
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Excluir', 'Rascunho');
      },
    });
  }

  protected tramitar(processo: IProcesso): void {
    this.ref = this.dialogService.open(ProcessoTramitacaoComponent, {
      position: 'top',
      header: 'Tramitar Processo',
      contentStyle: { overflow: 'visible' },
      width: '500px',
      dismissableMask: true,
      data: {
        processo: processo,
        tabela: this.tabelaAtual,
      },
    });
  }

  protected distribuir(processo: IProcesso): void {
    this.ref = this.dialogService.open(ProcessoDistribuirComponent, {
      position: 'top',
      header: 'Distribuir Processo',
      contentStyle: { overflow: 'visible' },
      width: '500px',
      dismissableMask: true,
      data: {
        processo: processo,
        tabela: this.tabelaAtual,
      },
    });
  }

  protected arquivar(processo: IProcesso): void {
    this.ref = this.dialogService.open(ProcessoArquivarComponent, {
      position: 'top',
      header: 'Arquivar Processo',
      contentStyle: { overflow: 'visible' },
      width: '500px',
      dismissableMask: true,
      data: {
        processo: processo,
        tabela: this.tabelaAtual,
      },
    });
  }

  protected retornarSetorOrigem(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja retornar este processo?`,
      header: 'Retornar Processo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const request = {
          processoId: id,
        };
        this.inscricaoExcluir = this.processoService
          .retornarInstituicaoExterna(request)
          .subscribe({
            complete: () => {
              this.exibirMensagemService.mensagem(
                'success',
                'Serviço de Mensagem',
                [`Processo retornado com sucesso.`]
              );
              this.mudarTabela('#instituicoes-externas');
            },
            error: (resposta: HttpErrorResponse) => {
              const erro: IEntidade = resposta.error;
              this.exibirErro(erro.message!, 'Retornar', this.recipiente);
            },
          });
      },
    });
  }

  protected retornarDistribuicao(processo: IProcesso): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja retornar este processo?`,
      header: 'Retornar Processo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const request = {
          processoId: processo.id,
        };
        this.inscricaoExcluir = this.processoService
          .retornarDistribuicao(request)
          .subscribe({
            complete: () => {
              this.exibirMensagemService.mensagem(
                'success',
                'Serviço de Mensagem',
                [`Processo retornado com sucesso.`]
              );
              this.mudarTabela('#distribuidos-recebidos');
            },
            error: (resposta: HttpErrorResponse) => {
              const erro: IEntidade = resposta.error;
              this.exibirErro(erro.message!, 'Retornar', this.recipiente);
            },
          });
      },
    });
  }

  protected visualizarProcesso(processo: IProcesso): void {
    if (
      (this.tabelaAtual === '#recebidos' ||
        this.tabelaAtual === '#distribuidos-recebidos') &&
      processo.tramitacao!.lido === false
    ) {
      this.marcarProcessoLido(processo.tramitacao!.id!);
    }
    this.validaComponentService.liberar(true);
    this.router.navigate([`./visualizar/${processo.id}`], {
      relativeTo: this.activatedRoute,
    });
  }

  private marcarProcessoLido(id: number): void {
    this.inscricaoMarcarLido = this.processoService
      .marcarProcessoLido(id)
      .subscribe({
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Marcar Como Lido', this.recipiente);
        },
      });
  }

  protected adicionarDespacho(processoId: number): void {
    this.validaComponentService.liberar(true);
    this.dataService.guardarObjeto({
      processoId: processoId,
      rota: `processo/${this.rota}`,
    });
    this.router.navigate([`processo/${this.rota}/adicionar-despacho`]);
  }

  protected chamarJuntada(processo: IProcesso, tipo: string): void {
    this.ref = this.dialogService.open(ProcessoListaModalComponent, {
      position: 'top',
      header: `Juntada de Processos por ${tipo}`,
      width: '100%',
      style: { overflow: 'auto', maxHeight: '90vh' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
      data: {
        processo: processo,
        setorId: this.setorId,
        tipo: tipo,
      },
    });
  }

  protected chamarDesjuntada(idPai: number, id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja Desjuntar estes processos?`,
      header: 'Realizar Desjuntada',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.desjuntarProcessos(idPai, id),
    });
  }

  private desjuntarProcessos(idPai: number, id: number): void {
    this.desjuntando = true;

    this.inscricaoDesjuntar = this.processoService
      .desjuntadaProcesso(idPai, id)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Desjuntada Realizada Com Sucesso']
          );
          this.desjuntando = false;
          this.carregarVisualizacao$(TipoVisualizacaoEnum.RECEBIDO);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Desjuntar', this.recipiente);
          this.desjuntando = false;
        },
      });
  }

  protected verificarEstrela(processo: IProcesso): void {
    this.carregando = true;
    if (processo.favorito) {
      this.desfavoritar(processo.favoritoId!);
    } else {
      this.favoritar(processo.id!);
    }
  }

  protected favoritar(id: number): void {
    const request: IProcessoRequest = { processoId: id };

    this.inscricaoFavoritar = this.processoService
      .adicionarFavorito(request)
      .subscribe({
        complete: () => {
          this.atualizarTabela();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Favoritar', this.recipiente);
          this.atualizarTabela();
          this.carregando = false;
        },
      });
  }

  protected desfavoritar(favoritoId: number): void {
    this.inscricaoDesfavoritar = this.processoService
      .excluirFavorito(favoritoId)
      .subscribe({
        complete: () => {
          this.atualizarTabela();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Desfavoritar', this.recipiente);
          this.atualizarTabela();
          this.carregando = false;
        },
      });
  }

  private atualizarTabela(): void {
    const tabelaEventMap = {
      '#criados': 'mudancaListaProcessoNovo',
      '#recebidos': 'mudancaListaProcessoRecebido',
      '#enviados': 'mudancaListaProcessoEnviado',
      '#intituicoes-externas': 'mudancaListaProcessoIntituicaoExterna',
      '#favoritos': 'mudancaListaProcessoFavorito',
    };

    const tabela =
      (tabelaEventMap as Record<string, string>)[this.tabelaAtual] ||
      'mudancaListaProcessoNovo';

    //EventBus.getInstance().dispatch<any>(tabela);
    this.atualizarTotalizadores();
  }

  protected filtrarColunas(): IDefaultColumn[] {
    const colunasPorTabela = {
      [this.tabelas[0]]: [
        'id',
        'tipo.nome',
        'assunto.nome',
        'dataCadastro',
        'nivelAcesso',
      ],
      [this.tabelas[1]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'dataCadastro',
        'nivelAcesso',
      ],
      [this.tabelas[2]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'tramitacao.dataHoraTramitacao',
        'nivelAcesso',
      ],
      [this.tabelas[3]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'tramitacao.dataHoraTramitacao',
        'nivelAcesso',
      ],
      [this.tabelas[4]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'tramitacao.dataHoraTramitacao',
        'instituicaoExterna',
        'nivelAcesso',
      ],
      [this.tabelas[5]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'dataCadastro',
        'tramitacao.dataHoraTramitacao',
        'nivelAcesso',
      ],
      [this.tabelas[6]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'dataCadastro',
        'tramitacao.dataHoraTramitacao',
        'nivelAcesso',
      ],
      [this.tabelas[7]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'nivelAcesso',
      ],
      [this.tabelas[7]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'nivelAcesso',
      ],
      [this.tabelas[8]]: [
        'numeroProcesso',
        'tipo.nome',
        'assunto.nome',
        'nivelAcesso',
      ],
    };
    const colunasExibidas =
      colunasPorTabela[this.tabelaAtual] ||
      this.defaultColumns.map((col) => col.field);
    return this.defaultColumns.filter((col) =>
      colunasExibidas.includes(col.field)
    );
  }

  protected atualizarTela(table: Table): void {
    this.globalFilter = '';
    this.sort = ['id,asc'];
    table.reset();
  }

  protected linhaSelecionavel(event: any) {
    return true;
  }

  protected selecionarItem(item: IProcesso): void {
    this.processo = item;
  }

  protected globalFilterFields(): string[] {
    return this.defaultColumns.map((x) => x.dataMap);
  }

  protected onInputChange(tabela: Table, event: any) {
    if (event.target.value) tabela.filterGlobal(event.target.value, 'contains');
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

    this.carregarVisualizacao$(TipoVisualizacaoEnum.CRIADO);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    if (codigo !== 'PE070') {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        erro,
      ]);
    }
  }
}
