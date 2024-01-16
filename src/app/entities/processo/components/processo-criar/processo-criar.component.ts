import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { format, parse } from 'date-fns';
import { ConfirmationService } from 'primeng/api';

import { ProcessoService } from '../../services/processo.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { DataService } from 'src/app/shared/services/data.service';
//import { EventBus } from 'src/app/shared/services/event-bus.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { config } from 'src/app/core/config/config';
import { Variaveis } from 'src/app/shared/models/variaveis.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { IInteressadoProcesso } from 'src/app/shared/models/interessado-processo.model';
import { IDocumento } from 'src/app/shared/models/documento.model';
import { IAnexo } from 'src/app/shared/models/anexo.model';
import { IAnexoFile, IAnexoResult } from 'src/app/shared/models/anexo.model';
import {
  IProcesso,
  Processo,
  IProcessoRequest,
} from 'src/app/shared/models/processo.model';

@Component({
  selector: 'top-processo-atualizar',
  templateUrl: './processo-criar.component.html',
})
export class ProcessoCriarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Processo';
  rotaRetorno: string = 'processo/todos';

  etapa!: number;
  quantidadeDocumentos: number = 1;

  inscricaoUsuarioLogado!: Subscription;
  inscricaoSalvando!: Subscription;

  processo!: IProcesso;
  usuarioLogado!: IUsuarioLogado;

  documentos: IDocumento[] = [];
  arquivosResult: IAnexoResult[] = [];
  anexos: IAnexoFile[] = [];
  anexosSalvos: IAnexo[] = [];
  interessados: IInteressadoProcesso[] = [];
  interessadosSalvos: IInteressadoProcesso[] = [];

  salvando: boolean = false;
  formInfoGeralModificado: boolean = false;
  formDocumentosModificado: boolean = false;

  variaveis: Variaveis = {
    usuario: 'indefinido',
    setor: 'indefinido',
    orgao: 'indefinido',
  };

  panels: string[] = [
    '#panel-infoGeral',
    '#panel-documentos',
    '#panel-anexos',
    '#panel-interessados',
  ];

  panelButtons: string[] = [
    '#panelb-infoGeral',
    '#panelb-documentos',
    '#panelb-anexos',
    '#panelb-interessados',
  ];

  editFormGeral = this.formGeral.group({
    tipo: ['', Validators.required],
    template: [''],
    descricao: ['', [Validators.required, Validators.maxLength(5000)]],
    naturezaProcesso: ['', Validators.required],
    numeroOriginal: [],
    dataAutuacao: [],
    assunto: ['', Validators.required],
    nivelAcesso: ['', Validators.required],
    hipoteseLegal: [''],
    tramitaMultSetor: ['', Validators.required],
  });

  editFormDocumento = this.formDocumento.group({
    tipo: ['', Validators.required],
    numero: [],
    template: [''],
    assunto: ['', Validators.required],
    conteudo: ['', [Validators.required, Validators.maxLength(5000)]],
    observacao: [],
  });

  constructor(
    private processoService: ProcessoService,
    private confirmationService: ConfirmationService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private dataService: DataService,
    private formGeral: FormBuilder,
    private formDocumento: FormBuilder,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.buscarOrigens();
    this.processo = new Processo();
    this.atualizarFormularios();
  }

  ngOnDestroy(): void {
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoSalvando) this.inscricaoSalvando.unsubscribe();
  }

  private buscarOrigens(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.usuarioLogado = resposta;
        //this.logo = `data:image/png;base64,${this.usuarioLogado.logo}`;
        this.variaveis.usuario = this.usuarioLogado.nome;
        this.variaveis.setor = this.usuarioLogado.setor!.sigla!;
        this.variaveis.orgao = this.usuarioLogado.orgao!.sigla!;
        //console.log('user: ', this.usuarioLogado);
      });
  }

  private atualizarFormularios(): void {
    const dados = this.dataService.receberObjeto() || {};
    this.dataService.limparObjeto();

    this.rotaRetorno = dados.rota! || 'processo/todos';

    if (dados.objeto === undefined) {
      this.etapa = 0;
      this.processo.anexos = [];
    } else {
      this.processo = dados.objeto;
      this.etapa = this.processo.etapaProcesso!;
      this.interessadosSalvos = this.processo.interessados!;
      this.anexosSalvos = this.processo.anexos!;
      this.documentos = this.processo.documentos!;
      if (this.documentos.length > 0) {
        let documentosExistentes = this.documentos.map((documento) => ({
          numeroDocumento: this.quantidadeDocumentos++,
          tipoDocumentoId: documento.tipoDocumentoId,
          tipoDocumento: documento.tipoDocumento,
          numero: documento.numero,
          assunto: documento.assunto,
          conteudo: documento.texto || '',
          observacao: documento.observacao,
        }));
        this.documentos = documentosExistentes;
      }
    }
    this.abrirAcordion(this.etapa);
  }

  private abrirAcordion(etapa: number): void {
    if (etapa >= 0 && etapa <= 3) {
      const panel = this.elementRef.nativeElement.querySelector(
        this.panels[etapa]
      );
      const panelButton = this.elementRef.nativeElement.querySelector(
        this.panelButtons[etapa]
      );
      panel.classList.add('show');
      panelButton.classList.remove('collapsed');
    }
  }

  private fecharAcordions(): void {
    for (let i = 0; i < 4; i++) {
      const panel = this.elementRef.nativeElement.querySelector(this.panels[i]);
      const panelButton = this.elementRef.nativeElement.querySelector(
        this.panelButtons[i]
      );
      if (panel.classList.contains('show')) panel.classList.remove('show');
      if (!panelButton.classList.contains('collapsed'))
        panelButton.classList.add('collapsed');
    }
  }

  protected cancelar(): void {
    // EventBus.getInstance().dispatch<any>('mudancaListaProcesso');
    this.router.navigate([this.rotaRetorno]);
  }

  protected concluir(): void {
    //  EventBus.getInstance().dispatch<any>('mudancaListaProcesso');
    this.router.navigate(['processo/criados']);
  }

  private ajustarTela(): void {
    this.fecharAcordions();
    this.abrirAcordion(this.etapa);
    if (this.etapa < 3) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  protected informarMudancaFormGeral(modificados: boolean): void {
    if (modificados) this.formInfoGeralModificado = true;
  }

  protected informarMudancaDocumentos(modificados: boolean): void {
    if (modificados) this.formDocumentosModificado = true;
  }

  private buscarInformacoesDoFormulario(): void {
    this.processo.tipoId = this.editFormGeral.get(['tipo'])!.value.id;
    this.processo.tipo = this.editFormGeral.get(['tipo'])!.value;
    this.processo.tramitaMultSetor =
      this.editFormGeral.get(['tramitaMultSetor'])?.value === 'sim'
        ? true
        : false;
    this.processo.descricao = this.substituirVariaveis(
      this.editFormGeral.get(['descricao'])!.value
    );
    this.processo.naturezaProcesso = this.editFormGeral.get([
      'naturezaProcesso',
    ])!.value;
    this.processo.numeroOriginal = this.editFormGeral.get([
      'numeroOriginal',
    ])!.value;
    this.processo.dataAutuacao = this.editFormGeral.get([
      'dataAutuacao',
    ])!.value;
    this.processo.assuntoId = this.editFormGeral.get(['assunto'])!.value.id;
    this.processo.assunto = this.editFormGeral.get(['assunto'])!.value;
    this.processo.nivelAcesso = this.editFormGeral.get(['nivelAcesso'])!.value;
    this.processo.hipoteseLegalId = this.editFormGeral.get([
      'hipoteseLegal',
    ])!.value?.id;
    this.processo.hipoteseLegal = this.editFormGeral.get([
      'hipoteseLegal',
    ])!.value;
  }

  protected salvarInfoGeral(rascunho: boolean): void {
    if (!this.editFormGeral.valid) {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        'Formulário Incompleto',
      ]);
      this.salvando = false;
      return;
    }

    if (!this.formInfoGeralModificado && this.etapa > 0) {
      //console.log('Não precisou salvar InfoGeral');
      this.salvarDocumentos(rascunho);
      return;
    }

    this.salvando = true;

    this.buscarInformacoesDoFormulario();

    const request = {
      ...(this.processo.id !== undefined ? { id: this.processo.id } : {}),
      assuntoId: this.processo.assuntoId,
      tipoId: this.processo.tipoId,
      tramitaMultSetor: this.processo.tramitaMultSetor,
      descricao: this.processo.descricao,
      naturezaProcesso: this.processo.naturezaProcesso,
      nivelAcesso: this.processo.nivelAcesso,
      ...(this.processo.naturezaProcesso === 'EXTERNO'
        ? {
            numeroOriginal: this.processo.numeroOriginal,
            dataAutuacao: this.formatarData(this.processo.dataAutuacao!),
          }
        : {}),
      ...(this.processo.nivelAcesso !== 'PUBLICO'
        ? {
            hipoteseLegalId: this.processo.hipoteseLegalId,
          }
        : {}),
    };

    this.chamarServicoIncluirProcesso(
      this.processoService.incluirProcesso(request),
      rascunho
    );
  }

  protected salvarDocumentos(rascunho: boolean): void {
    if (this.documentos.length === 0) {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        `Processo Precisa De Pelo Menos Um Documento Associado.`,
      ]);
      this.formInfoGeralModificado = false;
      this.salvando = false;
      return;
    }

    if (!this.formDocumentosModificado && this.etapa > 1) {
      //console.log('Não precisou salvar Documentos');
      this.salvarAnexos(rascunho);
      return;
    }

    this.salvando = true;

    this.processo.documentos = this.documentos.map((documento) => ({
      tipoDocumentoId: documento.tipoDocumento!.id,
      numero: documento.numero,
      assunto: documento.assunto,
      conteudo: documento.conteudo,
      observacao: documento.observacao,
      // signatarios: [
      //   {
      //     UsuarioId: 11,
      //     cargoUsuario: 'Cargo',
      //     nomeUsuario: 'Fagroso',
      //     statusSignatario: 'PENDENTE',
      //   },
      //],
    }));

    const request = {
      id: this.processo.id,
      documentos: this.processo.documentos,
    };

    this.chamarServicoIncluirDocumentos(
      this.processoService.incluirDocumentosLista(request),
      rascunho
    );
  }

  protected salvarAnexos(rascunho: boolean): void {
    if (this.anexos.length === 0) {
      if (this.etapa === 2) {
        this.etapa++;
        this.ajustarTela();
        this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
          `Nenhum Anexo Foi Incluído No Processo`,
        ]);
        this.aoSalvarComSucesso('Rascunho', 'Salvo');
      } else {
        //console.log('Não precisou salvar Anexos');
        this.salvarInteressados(rascunho);
      }
    } else {
      this.salvando = true;
      const listPayload: IAnexoResult[] = [];

      for (const anexo of this.anexos) {
        let findAnexo = this.arquivosResult.find(
          (x) => x.chaveArquivo == anexo.chaveArquivo
        );

        if (findAnexo === undefined) {
          const payload = {
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

      this.upload(listPayload, rascunho);
    }
  }

  private upload(payloads: IAnexoResult[], rascunho: boolean) {
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
        this.criarAnexos(arquivosEnviados, rascunho);
      }
    };
  }

  private criarAnexos(lista: IAnexoResult[], rascunho: boolean): void {
    this.processo.anexos = [];
    const anexosMap = new Map<string, any>();

    for (const anexo of this.anexos) {
      anexosMap.set(anexo.chaveArquivo!, anexo);
    }

    for (const item of lista) {
      const anexo = anexosMap.get(item.chaveArquivo!);

      if (anexo) {
        const objetoUnificado: IAnexo = {
          nome: item.nome,
          nomeOriginal: anexo.nome,
          extensao: anexo.extensao,
          tipoAnexoId: anexo.tipo.id,
          // signatarios: [
          //   {
          //     UsuarioId: 11,
          //     cargoUsuario: 'Cargo',
          //     nomeUsuario: 'Fagroso',
          //     statusSignatario: 'PENDENTE',
          //   },
          // ],
        };
        this.processo.anexos.push(objetoUnificado);
      }
    }

    const request = {
      id: this.processo.id,
      anexos: this.processo.anexos,
    };

    this.chamarServicoIncluirAnexos(
      this.processoService.incluirAnexosLista(request),
      rascunho
    );
  }

  protected salvarInteressados(rascunho: boolean): void {
    if (this.interessados.length >= 1) {
      this.salvando = true;

      // const interessadosNovos: number[] = this.interessados.map(
      //   (interessado) => interessado.id
      // );

      const interessadosNovos = this.interessados
        .map((interessado) => (interessado?.id ? interessado.id : 0))
        .filter((id) => id !== 0);

      const request: IProcessoRequest = {
        id: this.processo.id,
        interessados: interessadosNovos || [],
      };

      this.chamarServicoIncluirInteressados(
        this.processoService.incluirInteressadosLista(request),
        rascunho
      );
    } else if (rascunho) {
      if (this.etapa === 3) {
        this.etapa++;
        this.ajustarTela();
        this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
          `Nenhum Interessado No Processo Foi Incluído`,
        ]);
        this.aoSalvarComSucesso('Rascunho', 'Salvo');
      } else {
        //console.log('Não precisou salvar Interessados');
        this.aoSalvarComSucesso('Rascunho', 'Salvo');
      }
    } else {
      this.salvarProcesso();
    }
  }

  protected confirmarSalvar(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja criar este processo?',
      header: 'Criar o Processo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.salvarInfoGeral(false),
    });
  }

  protected salvarProcesso(): void {
    this.salvando = true;
    const request = {
      id: this.processo.id,
    };

    this.inscricaoSalvando = this.processoService
      .incluirNumeroProcesso(request)
      .subscribe({
        error: (resposta: HttpErrorResponse) => {
          this.salvando = false;
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Salvar', this.recipiente);
        },
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            [`Processo Criado Com Sucesso.`]
          );
          this.concluir();
        },
      });
  }

  private chamarServicoIncluirProcesso(
    resultado: Observable<HttpResponse<IEntidade>>,
    rascunho: boolean
  ): void {
    this.inscricaoSalvando = resultado.subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        const dados = corpo!.data;

        if (this.etapa === 0) {
          this.processo.id = dados.id;
          this.etapa++;
          this.ajustarTela();
          this.aoSalvarComSucesso('Rascunho', 'Salvo');
          //console.log('complete InfoGeral');
        } else {
          //console.log('salvou InfoGeral');
          this.salvarDocumentos(rascunho);
        }
      },
      error: (resposta: HttpErrorResponse) => {
        this.salvando = false;
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  private chamarServicoIncluirDocumentos(
    resultado: Observable<HttpResponse<IEntidade>>,
    rascunho: boolean
  ): void {
    this.inscricaoSalvando = resultado.subscribe({
      complete: () => {
        if (this.etapa === 1) {
          this.etapa++;
          this.ajustarTela();
          this.aoSalvarComSucesso('Rascunho', 'Salvo');
          //console.log('complete Documentos');
        } else {
          //console.log('salvou Documentos');
          this.salvarAnexos(rascunho);
        }
      },
      error: (resposta: HttpErrorResponse) => {
        this.salvando = false;
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  private chamarServicoIncluirAnexos(
    resultado: Observable<HttpResponse<IEntidade>>,
    rascunho: boolean
  ): void {
    this.inscricaoSalvando = resultado.subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        const dados = corpo!.data;

        const anexos = dados.anexos;
        this.incluirAnexosSalvos(anexos);
        if (this.etapa === 2) {
          this.etapa++;
          this.ajustarTela();
          this.aoSalvarComSucesso('Rascunho', 'Salvo');
          //console.log('complete Anexos');
        } else {
          // console.log('salvou Anexos');
          this.salvarInteressados(rascunho);
        }
      },
      error: (resposta: HttpErrorResponse) => {
        this.salvando = false;
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  private chamarServicoIncluirInteressados(
    resultado: Observable<HttpResponse<IEntidade>>,
    rascunho: boolean
  ): void {
    this.inscricaoSalvando = resultado.subscribe({
      complete: () => {
        if (rascunho) {
          this.incluirInteressadosSalvos(this.interessados);
          if (this.etapa === 3) {
            this.etapa++;
            this.ajustarTela();
            //  console.log('complete Interessados');
          } else {
            //  console.log('salvou Interessados');
          }
          this.aoSalvarComSucesso('Rascunho', 'Salvo');
        } else {
          this.salvarProcesso();
        }
      },
      error: (resposta: HttpErrorResponse) => {
        this.salvando = false;
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  private aoSalvarComSucesso(recipiente: string, acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${recipiente} ${acao} Com Sucesso.`,
    ]);
    this.formInfoGeralModificado = false;
    this.formDocumentosModificado = false;
    this.salvando = false;
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  private incluirAnexosSalvos(anexos: IAnexo[]): void {
    this.anexos = [];

    anexos.forEach((anexo: IAnexo) => {
      const existe = this.anexosSalvos.find(
        (salvo) => salvo.codigoValidador === anexo.codigoValidador
      );
      if (!existe) {
        this.anexosSalvos.push(anexo);
      }
    });
  }

  private incluirInteressadosSalvos(
    interessados: IInteressadoProcesso[]
  ): void {
    this.interessados = [];

    interessados.forEach((interessado: IInteressadoProcesso) => {
      const existe = this.interessadosSalvos.find(
        (salvo) => salvo.id === interessado.id
      );
      if (!existe) {
        this.interessadosSalvos.push(interessado);
      }
    });
  }

  private formatarData(data: Date | string): string {
    if (typeof data === 'string') {
      const dataParsed = parse(data, 'dd/MM/yyyy', new Date());
      return format(dataParsed, 'yyyy-MM-dd');
    }
    return format(data, 'yyyy-MM-dd');
  }

  private substituirVariaveis(texto: string): string {
    const variaveis = this.variaveis;
    return texto.replace(
      /\$(\w+)\$/g,
      (match, variavel) =>
        (variaveis as Record<string, string>)[variavel] ?? match
    );
  }
}
