import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { TemplateDespachoService } from '../../template-despacho.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import {
  EDITORCONFIG,
  TEXTO_TEMPLATE,
} from 'src/app/shared/constants/config.constants';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  ITemplateDespacho,
  TemplateDespacho,
} from 'src/app/shared/models/template-despacho.model';

@Component({
  selector: 'top-template-despacho-atualizar',
  templateUrl: './template-despacho-atualizar.component.html',
})
export class TemplateDespachoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Template de Despacho';
  acao: string = 'Criar';
  templateDespacho?: ITemplateDespacho;

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;
  protected texto_template = TEXTO_TEMPLATE;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.templateDespacho?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    template: [
      '',
      [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(5000),
      ],
    ],
  });

  constructor(
    private templateDespachoService: TemplateDespachoService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarTemplateDespacho$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarTemplateDespacho$(id: number): void {
    this.inscricaoConsulta = this.templateDespachoService
      .consultarTemplateDespacho(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.templateDespacho = corpo.data;
          this.atualizarFormulario();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  protected onReady(editor: DecoupledEditor): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(editor.ui.view.toolbar.element!, element);
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.templateDespacho?.id,
      nome: this.templateDespacho?.nome,
      template: this.templateDespacho?.template || '',
    });
    if (this.templateDespacho != null) this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['template-despacho']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const templateDespacho = this.criarFormulario();

      if (templateDespacho.id === undefined) {
        this.chamarServico(
          this.templateDespachoService.incluirTemplateDespacho(
            templateDespacho
          ),
          'criado'
        );
      } else {
        this.chamarServico(
          this.templateDespachoService.atualizarTemplateDespacho(
            templateDespacho
          ),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ITemplateDespacho {
    return {
      ...new TemplateDespacho(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      template: this.editForm.get(['template'])!.value,
    };
  }

  private chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>,
    acao: string
  ): void {
    this.inscricaoServico = resultado.subscribe({
      complete: () => this.seguir_sucesso(acao),
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message || '', 'Salvar', this.recipiente);
      },
    });
  }

  private seguir_sucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${this.recipiente} ${acao} com sucesso.`,
    ]);
    this.salvando = false;
    this.cancelar();
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
