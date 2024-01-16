import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { TemplateProcessoService } from '../../template-processo.service';
import { TipoProcessoService } from '../../../tipo-processo/tipo-processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import {
  EDITORCONFIG,
  TEXTO_TEMPLATE,
} from 'src/app/shared/constants/config.constants';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  ITemplateProcesso,
  TemplateProcesso,
} from 'src/app/shared/models/template-processo.model';
import {
  ITipoProcesso,
  TipoProcesso,
} from 'src/app/shared/models/tipo-processo.model';

@Component({
  selector: 'top-template-processo-atualizar',
  templateUrl: './template-processo-atualizar.component.html',
})
export class TemplateProcessoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Template de Processo';
  acao: string = 'Criar';
  templateProcesso?: ITemplateProcesso;
  tiposProcesso: ITipoProcesso[] = [];

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;
  protected texto_template = TEXTO_TEMPLATE;

  inscricaoConsulta!: Subscription;
  inscricaoTipos!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.templateProcesso?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    tipo: [new TipoProcesso(), Validators.required],
    texto: [
      '',
      [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(5000),
      ],
    ],
  });

  constructor(
    protected templateProcessoService: TemplateProcessoService,
    protected tipoProcessoService: TipoProcessoService,
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
        this.consultarTemplateProcesso$(Number(id));
      } else {
        this.limparDropdown();
        this.carregarTiposDocumento$(false);
        this.carregando = false;
      }
    });
  }

  private consultarTemplateProcesso$(id: number): void {
    this.inscricaoConsulta = this.templateProcessoService
      .consultarTemplateProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.templateProcesso = corpo.data;
          this.carregarTiposDocumento$(true);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  private carregarTiposDocumento$(id: boolean): void {
    this.inscricaoTipos = this.tipoProcessoService
      .consultarTiposProcesso()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.tiposProcesso = corpo.data;
          if (id) this.atualizarFormulario(true);
        },
        error: (resposta: HttpErrorResponse) => {
          this.tiposProcesso = [];
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
      id: this.templateProcesso?.id,
      nome: this.templateProcesso?.nome,
      texto: this.templateProcesso?.texto || '',
      tipo: this.templateProcesso?.tipo,
    });
    if (!completo) this.limparDropdown();
    this.editForm.markAllAsTouched();
    this.carregando = false;
  }

  private limparDropdown(): void {
    this.editForm.patchValue({
      tipo: undefined,
    });
  }

  protected cancelar(): void {
    this.router.navigate(['template-processo']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const templateProcesso = this.criarFormulario();

      if (templateProcesso.id === undefined) {
        this.chamarServico(
          this.templateProcessoService.incluirTemplateProcesso(
            templateProcesso
          ),
          'criado'
        );
      } else {
        this.chamarServico(
          this.templateProcessoService.atualizarTemplateProcesso(
            templateProcesso
          ),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ITemplateProcesso {
    return {
      ...new TemplateProcesso(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      texto: this.editForm.get(['texto'])!.value,
      tipoId: this.editForm.get(['tipo'])!.value.id,
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
    this.router.navigate(['template-processo']);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
