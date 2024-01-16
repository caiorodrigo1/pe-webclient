import { Component, OnInit, OnDestroy, Input, Optional } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ProcessoService } from '../../services/processo.service';
import { TemplateDespachoService } from 'src/app/entities/crud/template-despacho/template-despacho.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { DataService } from 'src/app/shared/services/data.service';
import { EDITORCONFIG } from 'src/app/shared/constants/config.constants';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { Variaveis } from 'src/app/shared/models/variaveis.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { Despacho, IDespacho } from 'src/app/shared/models/despacho.model';
import { ITemplateDespacho } from 'src/app/shared/models/template-despacho.model';

@Component({
  selector: 'top-processo-despacho',
  templateUrl: './processo-despacho.component.html',
})
export class ProcessoDespachoComponent implements OnInit, OnDestroy {
  @Input() processoId!: number;
  @Input() parent: boolean = false;

  templatesDespacho: ITemplateDespacho[] = [];

  recipiente: string = 'Processo';
  rotaRetorno: string = 'processo';

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;

  inscricaoUsuarioLogado!: Subscription;
  inscricaoDespacho!: Subscription;
  inscricaoTemplate!: Subscription;

  isModal: boolean = false;
  salvando: boolean = false;

  variaveis: Variaveis = {
    usuario: 'indefinido',
    setor: 'indefinido',
    orgao: 'indefinido',
  };

  @Input() editForm = this.form.group({
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
        Validators.maxLength(5000),
      ],
    ],
    observacao: [''],
  });

  constructor(
    private processoService: ProcessoService,
    private templateDespachoService: TemplateDespachoService,
    private usuarioLogadoService: UsuarioLogadoService,
    private dataService: DataService,
    private exibirMensagemService: ExibirMensagemService,
    private form: FormBuilder,
    private router: Router,
    @Optional() private ref: DynamicDialogRef,
    @Optional() private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    if (this.config) this.isModal = true;
    this.buscarOrigens();
    this.carregarTemplates$();
    if (!this.parent) this.receberDados();
  }

  ngOnDestroy(): void {
    if (this.inscricaoTemplate) this.inscricaoTemplate.unsubscribe();
    if (this.inscricaoDespacho) this.inscricaoDespacho.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
  }

  private buscarOrigens() {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.variaveis.usuario = resposta.nome;
        this.variaveis.setor = resposta.setor!.sigla;
        this.variaveis.orgao = resposta.orgao!.sigla;
      });
  }

  private receberDados() {
    this.processoId = this.dataService.receberObjeto().processoId;
    this.rotaRetorno = this.dataService.receberObjeto().rota;
    this.dataService.limparObjeto();
  }

  private carregarTemplates$(): void {
    this.inscricaoTemplate = this.templateDespachoService
      .consultarTemplatesDespacho()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.templatesDespacho = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.templatesDespacho = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Templates');
        },
      });
  }

  protected onChangeTemplateDespacho(templateDespacho: any): void {
    if (templateDespacho) {
      this.inscricaoDespacho = this.templateDespachoService
        .consultarTemplateDespacho(templateDespacho.id)
        .subscribe({
          next: (resposta: HttpResponse<IEntidade>) => {
            const corpo = resposta.body;
            const templateAtual = this.substituirVariaveis(
              corpo!.data.template
            );
            this.editForm.controls['descricao'].setValue(templateAtual);
          },
          error: (resposta: HttpErrorResponse) => {
            const erro: IEntidade = resposta.error;
            this.exibirErro(erro.message!, 'Buscar', 'Template');
          },
        });
    }
  }

  protected cancelar(): void {
    this.router.navigate([this.rotaRetorno]);
  }

  protected onReady(editor: DecoupledEditor): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(editor.ui.view.toolbar.element!, element);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const despacho = this.criarFormulario();

      this.chamarServico(
        this.processoService.adicionarDespacho(despacho),
        'Adicionado'
      );
    }
  }

  private criarFormulario(): IDespacho {
    return {
      ...new Despacho(),
      processoId: this.processoId,
      nomeSetor: this.variaveis.setor,
      assunto: this.editForm.get(['assunto'])!.value,
      texto: this.substituirVariaveis(this.editForm.get(['descricao'])!.value),
      observacao: this.editForm.get(['observacao'])!.value,
    };
  }

  private substituirVariaveis(texto: string): string {
    const variaveis = this.variaveis;
    return texto.replace(
      /\$(\w+)\$/g,
      (match, variavel) =>
        (variaveis as Record<string, string>)[variavel] ?? match
    );
  }

  private chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>,
    acao: string
  ): void {
    this.inscricaoDespacho = resultado.subscribe({
      complete: () => this.seguir_sucesso(acao),
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Adicionar', 'Despacho');
      },
    });
  }

  private seguir_sucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `Despacho ${acao} ao ${this.recipiente} Com Sucesso.`,
    ]);
    this.salvando = false;
    this.router.navigate([this.rotaRetorno]);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
