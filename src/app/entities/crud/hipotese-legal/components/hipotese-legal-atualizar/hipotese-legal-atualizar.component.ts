import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { HipoteseLegalService } from '../../hipotese-legal.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IHipoteseLegal,
  HipoteseLegal,
} from 'src/app/shared/models/hipotese-legal.model';

@Component({
  selector: 'top-hipotese-legal-atualizar',
  templateUrl: './hipotese-legal-atualizar.component.html',
})
export class HipoteseLegalAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Hipótese Legal (LGPD)';
  acao: string = 'Criar';
  hipoteseLegal?: IHipoteseLegal;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  isModal: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.hipoteseLegal?.id],
    descricao: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    ativo: [true, Validators.required],
  });

  constructor(
    private hipoteseLegalService: HipoteseLegalService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    @Optional() private ref: DynamicDialogRef,
    @Optional() private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    if (this.config) this.isModal = true;
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
        this.consultarHipoteseLegal$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarHipoteseLegal$(id: number): void {
    this.inscricaoConsulta = this.hipoteseLegalService
      .consultarHipoteseLegal(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.hipoteseLegal = corpo.data;
          this.atualizarFormulario();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.hipoteseLegal?.id,
      descricao: this.hipoteseLegal?.descricao,
      ativo: this.hipoteseLegal ? this.hipoteseLegal?.ativo : true,
    });
    this.editForm.markAllAsTouched();
  }

  private criarFormulario(): IHipoteseLegal {
    return {
      ...new HipoteseLegal(),
      id: this.editForm.get(['id'])!.value || undefined,
      descricao: this.editForm.get(['descricao'])!.value,
      ativo: this.editForm.get(['ativo'])!.value,
    };
  }

  protected cancelar(): void {
    if (this.isModal) {
      this.ref.close();
    } else {
      this.router.navigate(['hipotese-legal']);
    }
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const hipoteseLegal = this.criarFormulario();

      if (hipoteseLegal.id === undefined) {
        this.chamarServico(
          this.hipoteseLegalService.incluirHipoteseLegal(hipoteseLegal),
          'criado'
        );
      } else {
        this.chamarServico(
          this.hipoteseLegalService.atualizarHipoteseLegal(hipoteseLegal),
          'atualizado'
        );
      }
    }
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
