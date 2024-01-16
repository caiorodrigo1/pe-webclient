import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { TipoAnexoService } from '../../tipo-anexo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoAnexo, TipoAnexo } from 'src/app/shared/models/tipo-anexo.model';

@Component({
  selector: 'top-tipo-anexo-atualizar',
  templateUrl: './tipo-anexo-atualizar.component.html',
})
export class TipoAnexoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Tipo de Anexo';
  acao: string = 'Criar';

  tipoAnexo?: ITipoAnexo;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  isModal: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.tipoAnexo?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
  });

  constructor(
    private tipoAnexoService: TipoAnexoService,
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
        this.consultarTipoAnexo$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarTipoAnexo$(id: number): void {
    this.inscricaoConsulta = this.tipoAnexoService
      .consultarTipoAnexo(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.tipoAnexo = corpo.data;
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
      id: this.tipoAnexo?.id,
      nome: this.tipoAnexo?.nome,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    if (this.isModal) {
      this.ref.close();
    } else {
      this.router.navigate(['tipo-anexo']);
    }
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;
      const tipoAnexo = this.criarFormulario();
      if (tipoAnexo.id === undefined) {
        this.chamarServico(
          this.tipoAnexoService.incluirTipoAnexo(tipoAnexo),
          'criado'
        );
      } else {
        this.chamarServico(
          this.tipoAnexoService.atualizarTipoAnexo(tipoAnexo),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ITipoAnexo {
    return {
      ...new TipoAnexo(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
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
