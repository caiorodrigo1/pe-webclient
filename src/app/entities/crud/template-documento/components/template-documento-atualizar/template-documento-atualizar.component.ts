import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { TemplateDocumentoService } from '../../template-documento.service';
import { TipoDocumentoService } from '../../../tipo-documento/tipo-documento.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import {
  EDITORCONFIG,
  TEXTO_TEMPLATE,
} from 'src/app/shared/constants/config.constants';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  ITemplateDocumento,
  TemplateDocumento,
} from 'src/app/shared/models/template-documento.model';
import {
  ITipoDocumento,
  TipoDocumento,
} from 'src/app/shared/models/tipo-documento.model';

@Component({
  selector: 'top-template-documento-atualizar',
  templateUrl: './template-documento-atualizar.component.html',
})
export class TemplateDocumentoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Template de Documento';
  acao: string = 'Criar';
  templateDocumento?: ITemplateDocumento;
  tiposDocumento: ITipoDocumento[] = [];

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;
  protected texto_template = TEXTO_TEMPLATE;

  inscricaoConsulta!: Subscription;
  inscricaoTipos!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.templateDocumento?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    tipoDocumento: [new TipoDocumento(), Validators.required],
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
    private templateDocumentoService: TemplateDocumentoService,
    private tipoDocumentoService: TipoDocumentoService,
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
    if (this.inscricaoTipos) this.inscricaoTipos.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarTemplateDespacho$(Number(id));
      } else {
        this.limparDropdown();
        this.carregarTiposDocumento$(false);
        this.carregando = false;
      }
    });
  }

  private consultarTemplateDespacho$(id: number): void {
    this.inscricaoConsulta = this.templateDocumentoService
      .consultarTemplateDocumento(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.templateDocumento = corpo.data;
          this.carregarTiposDocumento$(true);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  private carregarTiposDocumento$(id: boolean): void {
    this.inscricaoTipos = this.tipoDocumentoService
      .consultarTiposDocumento()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.tiposDocumento = corpo.data;
          if (id) this.atualizarFormulario(true);
        },
        error: (resposta: HttpErrorResponse) => {
          this.tiposDocumento = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', 'Tipos de Documento');
          if (id) this.atualizarFormulario(false);
        },
      });
  }

  protected onReady(editor: DecoupledEditor): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(editor.ui.view.toolbar.element!, element);
  }

  private atualizarFormulario(completo: boolean): void {
    this.editForm.patchValue({
      id: this.templateDocumento?.id,
      nome: this.templateDocumento?.nome,
      template: this.templateDocumento?.template || '',
      tipoDocumento: this.templateDocumento?.tipoDocumento,
    });
    if (!completo) this.limparDropdown();
    this.editForm.markAllAsTouched();
    this.carregando = false;
  }

  private limparDropdown(): void {
    this.editForm.patchValue({
      tipoDocumento: undefined,
    });
  }

  protected cancelar(): void {
    this.router.navigate(['template-documento']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const templateDocumento = this.criarFormulario();

      if (templateDocumento.id === undefined) {
        this.chamarServico(
          this.templateDocumentoService.incluirTemplateDocumento(
            templateDocumento
          ),
          'criado'
        );
      } else {
        this.chamarServico(
          this.templateDocumentoService.atualizarTemplateDocumento(
            templateDocumento
          ),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ITemplateDocumento {
    return {
      ...new TemplateDocumento(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      template: this.editForm.get(['template'])!.value,
      tipoDocumentoId: this.editForm.get(['tipoDocumento'])!.value.id,
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
