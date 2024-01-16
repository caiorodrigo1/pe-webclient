import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subscription, filter, forkJoin } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';

import { ProcessoService } from '../../services/processo.service';
import { ValidaComponentService } from 'src/app/shared/services/valida-component.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { processoDesmembrarComponent } from '../processo-desmembrar/processo-desmembrar.component';
import { SignatarioModalComponent } from 'src/app/shared/components/signatario-modal/signatario-modal.component';
import { VisualizarDocumentoComponent } from 'src/app/shared/components/visualizar-documento/visualizar-documento.component';
import { config } from 'src/app/core/config/config';
import { Variaveis } from 'src/app/shared/models/variaveis.model';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { AssinaturaConfirmarAcaoComponent } from 'src/app/entities/auxiliar/assinatura/components/assinatura-confirmar-acao.component';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoAnexo, TipoAnexo } from 'src/app/shared/models/tipo-anexo.model';
import { Despacho, IDespacho } from 'src/app/shared/models/despacho.model';
import { IAnexo } from 'src/app/shared/models/anexo.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { IUsuario } from 'src/app/shared/models/usuario.model';
import { IDocumento } from 'src/app/shared/models/documento.model';
import {
  IProcesso,
  IProcessoRequest,
  Processo,
} from 'src/app/shared/models/processo.model';
import { IInteressadoProcesso } from 'src/app/shared/models/interessado-processo.model';
import { IDocumentoProcesso } from 'src/app/shared/models/documentoProcesso.model';
import { ISignatarioRequest } from 'src/app/shared/models/signatario.model';
import { IAnexoFile, IAnexoResult } from 'src/app/shared/models/anexo.model';

@Component({
  selector: 'top-processo-visualizar',
  templateUrl: './processo-visualizar.component.html',
  styleUrls: ['./processo-visualizar.component.scss'],
})
export class ProcessoVisualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Processo';

  ref: DynamicDialogRef | undefined;

  processo!: IProcesso;
  processoPai!: IProcesso;
  processoPrincipal: IProcesso = new Processo();
  processosJuntados: IProcesso[] = [];
  processosAnexos: IProcesso[] = [];
  usuarioLogado!: IUsuarioLogado;

  totalRecursivo: number = 0;
  indice: number = 0;

  processosFilhos: number[] = [];
  listaDocumentosProcesso: IDocumentoProcesso[] = [];
  documentos: IDocumento[] = [];
  anexosAdicionados: IAnexo[] = [];
  interessados: IInteressadoProcesso[] = [];
  anexos: IAnexoFile[] = [];
  arquivosResult: IAnexoResult[] = [];
  signatarios: IUsuario[] = [];
  documentoLink!: string;
  linkArquivo: string[] = [];

  inscricaoUsuarioLogado!: Subscription;
  inscricaoSalvando!: Subscription;
  inscricaoExcluir!: Subscription;
  inscricaoBuscarJuntada!: Subscription;
  inscricaoAssinatura!: Subscription;
  inscricaoDesjuntar!: Subscription;
  inscricaoVisualizar!: Subscription;

  carregando: boolean = true;
  informacaoTotal: boolean = false;
  enviarSignatarios: boolean = false;
  adicionandoDocumento: boolean = false;
  adicionandoAnexo: boolean = false;
  adicionandoInteressado: boolean = false;
  adicionandoDespacho: boolean = false;
  salvando: boolean = false;
  desjuntando: boolean = false;
  paiCarregado: boolean = false;

  variaveis: Variaveis = {
    usuario: 'indefinido',
    setor: 'indefinido',
    orgao: 'indefinido',
    identificadorUsuario: 'indefinido',
  };

  editFormDocumento = this.formDocumento.group({
    tipo: ['', Validators.required],
    numero: [],
    template: [''],
    assunto: ['', Validators.required],
    conteudo: ['', [Validators.required, Validators.maxLength(50000)]],
    observacao: [],
  });

  editFormDespacho = this.formDespacho.group({
    assunto: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    template: [''],
    descricao: [
      '',
      [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(50000),
      ],
    ],
    observacao: [''],
  });

  cols!: any[];
  numCols = 0;

  anexo: any;
  tipo!: TipoAnexo;
  tiposAnexo: ITipoAnexo[] = [];

  _selectedColumns!: IDefaultColumn[];

  defaultColumns = [
    {
      field: 'id',
      header: '#',
      type: 'number',
      dataMap: 'id',
    },
    {
      field: 'tipo',
      header: 'Tipo',
      type: 'text',
      dataMap: 'tipo.',
    },
    {
      field: 'origem',
      header: 'Origem',
      type: 'text',
      dataMap: 'origem',
    },
    {
      field: 'destino',
      header: 'Destino',
      type: 'text',
      dataMap: 'destino',
    },
    {
      field: 'enviadoPor',
      header: 'Enviado Por',
      type: 'text',
      dataMap: 'enviadoPor',
    },
    {
      field: 'enviado',
      header: 'Enviado',
      type: 'date',
      dataMap: 'enviado',
    },
    {
      field: 'destinatario',
      header: 'Destinatário',
      type: 'text',
      dataMap: 'destinatario',
    },
    {
      field: 'lidoEm',
      header: 'Lido Em',
      type: 'date',
      dataMap: 'lidoEm',
    },
    {
      field: 'lidoPor',
      header: 'Lido Por',
      type: 'text',
      dataMap: 'lidoPor',
    },
    {
      field: 'nome',
      header: 'Nome',
      type: 'text',
      dataMap: 'nome',
    },
    {
      field: 'documento',
      header: 'CPF/CNPJ',
      type: 'string',
      dataMap: 'documento',
    },
    {
      field: 'adicionadoEm',
      header: 'Adicionado em',
      type: 'data',
      dataMap: 'adicionadoEm',
    },
    {
      field: 'assunto',
      header: 'Assunto',
      type: 'text',
      dataMap: 'assunto',
    },
    {
      field: 'tipoDocumento',
      header: 'Tipo do Documento',
      type: 'text',
      dataMap: 'tipoDocumento',
    },
    {
      field: 'dataCriacao',
      header: 'Data Criação',
      type: 'date',
      dataMap: 'dataCriacao',
    },
    {
      field: '',
      header: '',
      type: 'text',
      dataMap: '',
    },
    {
      field: 'nomeArquivo',
      header: 'Nome do Arquivo',
      type: 'text',
      dataMap: 'nomeArquivo',
    },
    {
      field: 'dataCriacao',
      header: 'Data da Criação',
      type: 'data',
      dataMap: 'dataCriacao',
    },
    {
      field: 'tipoAnexo',
      header: 'Tipo do Anexo',
      type: 'text',
      dataMap: 'tipoAnexo',
    },
    {
      field: 'extensao',
      header: 'Extensão',
      type: 'text',
      dataMap: '',
    },
    {
      field: '',
      header: '',
      type: 'text',
      dataMap: '',
    },
  ];

  tabelas = ['#documentos', '#tramitacao', '#interessados'];
  tab = {
    tab0: HTMLAnchorElement,
    tab1: HTMLAnchorElement,
    tab2: HTMLAnchorElement,
  };

  constructor(
    private processoService: ProcessoService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private validaComponentService: ValidaComponentService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private formDocumento: FormBuilder,
    private formDespacho: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  private buscarOrigens() {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.usuarioLogado = resposta;
        this.variaveis.usuario = this.usuarioLogado.nome;
        this.variaveis.setor = this.usuarioLogado.setor!.sigla;
        this.variaveis.orgao = this.usuarioLogado.orgao!.sigla;
        this.variaveis.identificadorUsuario =
          this.usuarioLogado.identificadorUsuario;
      });
  }

  ngOnInit(): void {
    this.buscarRota();
    this.buscarOrigens();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoSalvando) this.inscricaoSalvando.unsubscribe();
    if (this.inscricaoExcluir) this.inscricaoExcluir.unsubscribe();
    if (this.inscricaoAssinatura) this.inscricaoAssinatura.unsubscribe();
    if (this.inscricaoDesjuntar) this.inscricaoDesjuntar.unsubscribe();
    if (this.inscricaoVisualizar) this.inscricaoVisualizar.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      this.consultarProcesso$(Number(id), true);
    });
  }

  private consultarProcesso$(id: number, proprio: boolean, pai?: string): void {
    this.inscricaoVisualizar = this.processoService
      .consultarProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data || {};
          console.log('objeto: ', objeto);

          if (proprio) {
            this.listaDocumentosProcesso = [];
            this.processosJuntados = [];
            this.processosFilhos = [];
            this.processo = objeto;
            this.preencherDadosProcesso();
          } else if (pai) {
            if (pai === 'Apensacao') {
              this.processoPai = objeto;
              this.paiCarregado = true;
            } else if (pai === 'Anexacao') {
              this.processoPrincipal = objeto;
            }
          }
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.recipiente);
          this.carregando = false;
        },
      });
  }

  private preencherDadosProcesso() {
    this.processo.tramitacoes = this.processo.tramitacoes!.reverse();
    this.linkArquivo[0] = this.processo.pastaDocumentos!;
    this.linkArquivo[1] = this.processo.pastaAnexos!;

    this.processo.interessados!.sort((a, b) => {
      const dataA: any = new Date(a.dataAdicionadoProcesso!);
      const dataB: any = new Date(b.dataAdicionadoProcesso!);
      return dataA - dataB;
    });

    this.agruparDocumentos(
      this.processo.documentos!,
      this.processo.despachos!,
      this.processo.anexos!,
      this.listaDocumentosProcesso
    );

    this.buscarJuntada(this.processo.id!, true);
  }

  private agruparDocumentos(
    documentos: IDocumento[],
    despachos: IDespacho[],
    anexos: IAnexo[],
    lista: IDocumentoProcesso[]
  ): void {
    documentos.forEach((documento) => {
      const documentoProcesso: IDocumentoProcesso = {
        modelo: 'documento',
        documento: documento,
        tipo: documento.tipoDocumento!.nome || 'desconhecido',
        extensao: 'pdf',
        nomeAssunto: documento.assunto || 'desconhecido',
        data: documento.dataCadastro || '',
      };
      lista.push(documentoProcesso);
    });

    despachos.forEach((despacho) => {
      const despachoProcesso: IDocumentoProcesso = {
        modelo: 'despacho',
        documento: despacho,
        tipo: 'Despacho',
        extensao: 'pdf',
        nomeAssunto: despacho.assunto || 'desconhecido',
        data: despacho.dataCadastro || '',
      };
      lista.push(despachoProcesso);
    });

    anexos.forEach((anexo) => {
      const anexoProcesso: IDocumentoProcesso = {
        modelo: 'anexo',
        documento: anexo,
        tipo: anexo.tipoAnexo!.nome,
        extensao: anexo.extensao || 'desconhecido',
        nomeAssunto: anexo.nomeOriginal,
        data: anexo.dataCadastro || '',
      };
      lista.push(anexoProcesso);
    });
  }

  private buscarJuntada(id: number, primeiraChamada: boolean): void {
    this.totalRecursivo++;

    this.inscricaoBuscarJuntada = this.processoService
      .consultarJuntada(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data || [];

          // Adiciona os filhos do processo atual
          if (primeiraChamada) {
            this.processosJuntados = objeto;
            if (this.processo.processoPai) {
              this.consultarProcesso$(
                this.processo.processoPai,
                false,
                'Apensacao'
              );
            }
          }
          this.processosFilhos.push(
            ...objeto.map((processo: IProcesso) => processo.id)
          );

          // Consulta os filhos dos filhos
          objeto.forEach((processo: IProcesso) => {
            this.buscarJuntada(processo.id!, false);
          });

          // Verifica se esta é a última chamada recursiva
          if (--this.totalRecursivo === 0) {
            this.consultarFilhos(this.processosFilhos);
          }
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', `Juntada`);
        },
      });
  }

  private consultarFilhos(processosFilhosIds: number[]): void {
    //console.log(processosFilhosIds);
    const observables = processosFilhosIds.map((id) => {
      return this.processoService.consultarProcesso(id);
    });

    forkJoin(observables).subscribe((resultados) => {
      resultados.forEach((resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        const objeto = corpo!.data || {};
        this.agruparDocumentos(
          objeto.documentos,
          objeto.despachos,
          objeto.anexos,
          this.listaDocumentosProcesso
        );
      });

      this.ordenarDocumentos(this.listaDocumentosProcesso);
      this.carregando = false;
    });

    if (this.processosJuntados.length === 0) {
      this.ordenarDocumentos(this.listaDocumentosProcesso);
      this.carregando = false;
    }

    this.buscarProcessoPrincipal();
    this.buscarJuntadaAnexacao(this.processo.id!);
  }

  private ordenarDocumentos(lista: IDocumentoProcesso[]): void {
    lista = lista.sort((a, b) => {
      return new Date(a.data!).getTime() - new Date(b.data!).getTime();
    });
    this.carregando = false;
  }

  private buscarProcessoPrincipal(): void {
    if (this.processo.processoPrincipal)
      this.consultarProcesso$(
        this.processo.processoPrincipal,
        false,
        'Anexacao'
      );
  }

  private buscarJuntadaAnexacao(id: number): void {
    this.inscricaoBuscarJuntada = this.processoService
      .consultarJuntadaAnexacao(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data || [];

          this.processosAnexos = objeto;
          console.log('processosAnexos: ', this.processosAnexos);
          this.organizarDocumentosJuntadaAnexacao();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', `Juntada`);
        },
      });
  }

  private organizarDocumentosJuntadaAnexacao(): void {
    this.processosAnexos.forEach((processo) => {
      if (processo.documentos && processo.documentos.length > 0) {
        const termo = processo.documentos[processo.documentos.length - 1];
        console.log('termo: ', termo);
        if (termo.tipoDocumentoId === 25) {
          const termoJuntada: IDocumentoProcesso = {
            modelo: 'documento',
            documento: termo,
            tipo: termo.tipoDocumento!.nome || 'desconhecido',
            extensao: 'pdf',
            nomeAssunto: termo.assunto || 'desconhecido',
            data: termo.dataCadastro || '',
          };
          this.listaDocumentosProcesso.push(termoJuntada);
        }
      }
    });

    this.ordenarDocumentos(this.listaDocumentosProcesso);

    this.processosAnexos.forEach((processo) => {
      if (processo.documentos && processo.documentos.length > 1) {
        const listaProcesso: IDocumentoProcesso[] = [];
        this.agruparDocumentos(
          processo.documentos.slice(0, -1),
          processo.despachos || [],
          processo.anexos || [],
          listaProcesso
        );
        this.ordenarDocumentos(listaProcesso);
        console.log('listaProcesso: ', listaProcesso);
        this.concatenarListaPosTermo(listaProcesso);
        this.indice++;
      }
    });
    this.indice = 0;

    this.carregando = false;
  }

  concatenarListaPosTermo(lista: IDocumentoProcesso[]) {
    for (
      this.indice;
      this.indice < this.listaDocumentosProcesso.length;
      this.indice++
    ) {
      if (
        this.listaDocumentosProcesso[this.indice].tipo === 'Termo de Juntada'
      ) {
        console.log('indice do termo: ', this.indice);
        this.listaDocumentosProcesso.splice(this.indice + 1, 0, ...lista);
        break;
      }
    }
    console.log('lista: ', this.listaDocumentosProcesso);
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

  protected cancelar(): void {
    this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
  }

  protected sanitizeContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  protected visualizarItem(
    documento: IDocumento | IAnexo | IDespacho,
    modelo: string
  ): void {
    if (documento.nome !== '') {
      if (modelo == 'documento' || modelo == 'despacho') {
        this.visualizarDocumento(
          documento,
          documento.linkArquivo!,
          true,
          false
        );
      } else if (modelo == 'anexo') {
        this.visualizarAnexo(documento);
      } else {
        this.exibirErro('Erro', 'Buscar', 'Modelo de Arquivo');
      }
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'O link para o arquivo não está disponível',
      ]);
    }
  }

  private visualizarAnexo(documento: IAnexo): void {
    if (documento.extensao == 'pdf') {
      this.visualizarDocumento(documento, documento.linkArquivo!, true, false);
    } else if (
      documento.extensao == 'jpg' ||
      documento.extensao == 'png' ||
      documento.extensao == 'ico'
    ) {
      const link = `${this.linkArquivo[1]}${documento.nome}`;
      console.log('link: ', link);
      this.visualizarDocumento(documento, link, false, true);
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'Visualização Não é Possível Neste Formato de Arquivo',
      ]);
    }
  }

  private visualizarDocumento(
    documento: any,
    link: string,
    pdf: boolean,
    img: boolean
  ): void {
    if (documento.nome === null) {
      this.exibirMensagemService.mensagem('error', 'Erro ao exibir arquivo', [
        'O link para o arquivo não está disponível',
      ]);
    } else {
      this.ref = this.dialogService.open(VisualizarDocumentoComponent, {
        position: 'top',
        header: 'Visualização de Documento',
        width: '100%',
        height: '100%',
        contentStyle: { overflow: 'visible' },
        dismissableMask: true,
        data: {
          link: link,
          pdf: pdf,
          img: img,
        },
      });
    }
  }

  protected abrirModalSignatarios(): void {
    this.ref = this.dialogService.open(SignatarioModalComponent, {
      position: 'top',
      header: 'Adicionar Signatário',
      width: '100%',
      style: { maxWidth: '500px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe((signatarios) => {
      if (signatarios) {
        signatarios.forEach((signatario: IUsuario) => {
          this.adicionarSignatario(signatario);
        });
      }
    });
  }

  protected abrirModalSignatariosTardio(documento: IDocumentoProcesso): void {
    this.ref = this.dialogService.open(SignatarioModalComponent, {
      position: 'top',
      header: 'Adicionar Signatário',
      width: '100%',
      style: { maxWidth: '500px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe((signatarios) => {
      if (signatarios) {
        this.adicionarSignatarioTardio(
          documento.documento?.id!,
          documento.modelo,
          signatarios
        );
      }
    });
  }

  private adicionarSignatario(novoSignatario: IUsuario): void {
    const duplicado = this.signatarios.find(
      (item) => item.id === novoSignatario.id
    );
    if (!duplicado) {
      this.signatarios.push(novoSignatario);
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        `Signatário já foi adicionado.`,
      ]);
    }
  }

  private adicionarSignatarioTardio(
    id: number,
    modelo: string,
    signatarios: IUsuario[]
  ): void {
    const listaSignatarios = signatarios.map((signatario) => ({
      UsuarioId: signatario.id,
      nomeUsuario: signatario.nome,
      cargoUsuario: 'Cargo',
      statusSignatario: 'PENDENTE',
    }));

    const endpoint =
      modelo === 'documento'
        ? 'incluirSignatarioDocumento'
        : modelo === 'anexo'
        ? 'incluirSignatarioAnexo'
        : '';

    if (!endpoint) {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        `Despacho não pode ter Signatários`,
      ]);
      return;
    }

    const request =
      modelo === 'documento'
        ? {
            documentoId: id,
            signatarios: listaSignatarios,
          }
        : modelo === 'anexo'
        ? {
            anexoId: id,
            signatarios: listaSignatarios,
          }
        : {};

    this.chamarServicoSalvar(
      this.processoService[endpoint](id, request),
      'Signatários',
      'Incluídos',
      false
    );
  }

  protected excluirSignatario(signatario: any): void {
    this.signatarios = this.signatarios.filter(
      (item) => item.id !== signatario.id
    );
  }

  protected salvarInteressados(): void {
    if (this.interessados.length >= 1) {
      this.salvando = true;

      const interessadosNovos = this.interessados
        .map((interessado) => (interessado?.id ? interessado.id : 0))
        .filter((id) => id !== 0);

      const request: IProcessoRequest = {
        id: this.processo.id,
        interessados: interessadosNovos || [],
      };

      this.chamarServicoSalvar(
        this.processoService.incluirInteressadosLista(request),
        'Interessados',
        'Incluídos',
        false
      );
    } else {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        `Nenhum Interessado No Processo Foi Incluído`,
      ]);
    }
  }

  protected salvarDocumento(): void {
    if (this.editFormDocumento.valid) {
      this.salvando = true;
      const request = {
        processoId: this.processo.id,
        nomeSetor: this.usuarioLogado.setor!.sigla,
        tipoDocumentoId: this.editFormDocumento.get(['tipo'])!.value.id,
        numero: this.editFormDocumento.get(['numero'])!.value,
        assunto: this.editFormDocumento.get(['assunto'])!.value,
        observacao: this.editFormDocumento.get(['observacao'])!.value,
        conteudo: this.substituirVariaveis(
          this.editFormDocumento.get(['conteudo'])!.value
        ),
      };

      this.adicionandoDocumento = true;
      const temSignatarios = this.signatarios.length >= 1 ? true : false;

      this.chamarServicoSalvar(
        this.processoService.adicionarDocumento(request),
        'Documento',
        'Incluído',
        temSignatarios
      );
    } else {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        `Documento Inválido.`,
      ]);
    }
  }

  protected salvarDespacho(): void {
    if (this.editFormDespacho.valid) {
      this.salvando = true;

      const despacho: IDespacho = {
        ...new Despacho(),
        processoId: this.processo.id,
        nomeSetor: this.variaveis.setor,
        assunto: this.editFormDespacho.get(['assunto'])!.value,
        texto: this.substituirVariaveis(
          this.editFormDespacho.get(['descricao'])!.value
        ),
        observacao: this.editFormDespacho.get(['observacao'])!.value,
      };

      this.chamarServicoSalvar(
        this.processoService.adicionarDespacho(despacho),
        'Despacho',
        'Incluído',
        false
      );
    } else {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        `Despacho inválido`,
      ]);
    }
  }

  protected salvarAnexo(): void {
    if (this.anexos.length >= 1) {
      this.salvando = true;
      let listPayload = [];
      for (const anexo of this.anexos) {
        let findAnexo = this.arquivosResult.find(
          (x) => x.chaveArquivo == anexo.chaveArquivo
        );
        if (findAnexo == undefined) {
          let payload = {
            arquivo: anexo.data,
            enviado: false,
            metadata: {
              chaveArquivo: anexo.chaveArquivo,
              extensao: anexo.extensao,
              nome: anexo.nome,
              tipo: anexo.tipo,
              tamanho: anexo.tamanho,
            },
          };
          listPayload.push(payload);
        }
      }
      this.upload(listPayload);
    } else {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        `Nenhum Anexo Foi Incluído No Processo`,
      ]);
    }
  }

  private upload(payloads: any[]): void {
    const worker = new Worker(
      new URL('../../../../shared/workers/file-manager.worker', import.meta.url)
    );
    const url = config['apiUrl'];
    const token = window.sessionStorage.getItem('authenticationToken');

    worker.postMessage({ payloads, url, token });

    worker.onmessage = (event) => {
      let findAnexo = this.anexos.find(
        (x) => x.chaveArquivo == event.data.chaveArquivo
      );

      if (findAnexo != undefined) {
        this.arquivosResult.push(event.data);
      }

      if (this.anexos.length == this.arquivosResult.length) {
        let arquivosEnviados = this.arquivosResult.filter(
          (x) => x.enviado == true && (x.nome != undefined || x.nome != '')
        );
        this.criarAnexos(arquivosEnviados);
      }
    };
  }

  private criarAnexos(lista: any): void {
    const anexosLista: IAnexo[] = [];
    const anexosMap = new Map<string, any>();

    for (const anexo of this.anexos) {
      anexosMap.set(anexo.chaveArquivo!, anexo);
    }

    for (const item of lista) {
      const anexo = anexosMap.get(item.chaveArquivo);

      if (anexo) {
        const objetoUnificado: IAnexo = {
          processoId: this.processo.id,
          nome: item.nome,
          nomeOriginal: anexo.nome,
          extensao: anexo.extensao,
          tipoAnexoId: anexo.tipo.id,
        };
        anexosLista.push(objetoUnificado);
      }
    }

    const request = anexosLista[0];

    this.adicionandoDocumento = false;
    const temSignatarios = this.signatarios.length >= 1 ? true : false;

    this.chamarServicoSalvar(
      this.processoService.adicionarAnexo(request),
      'Anexo',
      'Incluído',
      temSignatarios
    );
  }

  private salvarSignatarios(id: number): void {
    const listaSignatarios = this.signatarios.map((signatario) => ({
      UsuarioId: signatario.id,
      nomeUsuario: signatario.nome,
      cargoUsuario: 'Cargo',
      statusSignatario: 'PENDENTE',
    }));

    const request: ISignatarioRequest = this.adicionandoDocumento
      ? { documentoId: id, signatarios: listaSignatarios }
      : { anexoId: id, signatarios: listaSignatarios };

    const endpoint = this.adicionandoDocumento
      ? 'incluirSignatarioDocumento'
      : 'incluirSignatarioAnexo';

    this.chamarServicoSalvar(
      this.processoService[endpoint](id, request),
      'Signatários',
      'Incluídos',
      false
    );
  }

  private chamarServicoSalvar(
    resultado: Observable<HttpResponse<IEntidade>>,
    recipiente: string,
    acao: string,
    signatarios: boolean
  ): void {
    this.inscricaoSalvando = resultado.subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        if (signatarios) {
          const corpo = resposta.body;
          const objeto = corpo!.data || [];
          this.salvarSignatarios(objeto.id);
        } else {
          this.atualizarListas();
          this.salvando = false;
        }
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', recipiente);
      },
      complete: () => {
        this.aoSalvarComSucesso(recipiente, acao);
      },
    });
  }

  protected excluirInteressado(id: number): void {
    this.confirmationService.confirm({
      message: 'Deseja mesmo excluir este Interessado?',
      header: 'Confirme',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.chamarServicoExcluir(
          this.processoService.excluirInteressado_Processo(
            id,
            this.processo.id!
          ),
          'Interessado',
          'Excluído'
        );
      },
    });
  }

  protected excluirItem(id: number, modelo: string): void {
    if (modelo == 'documento') {
      this.excluirDocumento(id);
    } else if (modelo == 'anexo') {
      this.excluirAnexo(id);
    } else {
      this.excluirDespacho(id);
    }
  }

  private excluirDocumento(id: number): void {
    this.confirmationService.confirm({
      message: 'Deseja mesmo excluir este Documento?',
      header: 'Confirme',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.chamarServicoExcluir(
          this.processoService.excluirDocumento_Processo(id),
          'Documento',
          'Excluído'
        );
      },
    });
  }

  private excluirAnexo(id: number): void {
    this.confirmationService.confirm({
      message: 'Deseja mesmo excluir este Anexo?',
      header: 'Confirme',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.chamarServicoExcluir(
          this.processoService.excluirAnexo_Processo(id),
          'Anexo',
          'Excluído'
        );
      },
    });
  }

  private excluirDespacho(id: number): void {
    this.confirmationService.confirm({
      message: 'Deseja mesmo excluir este Despacho?',
      header: 'Confirme',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.chamarServicoExcluir(
          this.processoService.excluirDepacho_Processo(id),
          'Despacho',
          'Excluído'
        );
      },
    });
  }

  private chamarServicoExcluir(
    resultado: Observable<HttpResponse<IEntidade>>,
    recipiente: string,
    acao: string
  ): void {
    this.salvando = true;
    this.inscricaoExcluir = resultado.subscribe({
      complete: () => {
        this.aoSalvarComSucesso(recipiente, acao);
        this.atualizarListas();
        this.salvando = false;
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Excluir', recipiente);
      },
    });
  }

  private aoSalvarComSucesso(recipiente: string, acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${recipiente} ${acao} Com Sucesso.`,
    ]);
  }

  private atualizarListas(): void {
    this.documentos = [];
    this.interessados = [];
    this.anexos = [];
    this.arquivosResult = [];
    this.limparFormularios();

    this.consultarProcesso$(this.processo.id!, true);
  }

  protected limparFormularios(): void {
    this.editFormDespacho.reset();
    this.editFormDocumento.reset();
  }

  protected chamarAssinatura(documentoProcesso: IDocumentoProcesso): void {
    this.ref = this.dialogService.open(AssinaturaConfirmarAcaoComponent, {
      position: 'top',
      header: 'Assinatura de Documento',
      contentStyle: { overflow: 'visible' },
      width: '500px',
      dismissableMask: true,
      data: {
        id: documentoProcesso.documento!.id,
        modelo: documentoProcesso.modelo,
        acao: 'ASSINAR',
      },
    });

    this.ref.onClose.subscribe((result: boolean) => {
      if (result) this.atualizarListas();
    });
  }

  protected chamarDesmembramento(): void {
    this.ref = this.dialogService.open(processoDesmembrarComponent, {
      position: 'top',
      header: 'Desmembrar Processo',
      contentStyle: { overflow: 'visible' },
      width: '500px',
      dismissableMask: true,
      data: {
        processoId: this.processo.id,
        documentos: this.processo.documentos,
      },
    });
  }

  protected confirmarDesjuntada(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja Desjuntar estes processos?`,
      header: 'Realizar Desjuntada',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.desjuntarProcesso(id),
    });
  }

  private desjuntarProcesso(id: number): void {
    this.desjuntando = true;

    this.inscricaoDesjuntar = this.processoService
      .desjuntadaProcesso(this.processo.id!, id)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Desjuntada Realizada Com Sucesso']
          );
          this.desjuntando = false;
          this.atualizarListas();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Desjuntar', this.recipiente);
          this.desjuntando = false;
        },
      });
  }

  protected visualizarProcesso(id: number): void {
    this.carregando = true;
    this.validaComponentService.liberar(true);
    this.router.navigate([`../${id}`], { relativeTo: this.activatedRoute });
  }

  private substituirVariaveis(texto: string): string {
    const variaveis = this.variaveis;
    return texto.replace(
      /\$(\w+)\$/g,
      (match, variavel) =>
        (variaveis as Record<string, string>)[variavel] ?? match
    );
  }

  private exibirErro(codigo: string, acao: string, item: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${item}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
