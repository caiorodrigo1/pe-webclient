import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AssuntoProcessoService } from '../../assunto-processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  AssuntoProcesso,
  IAssuntoProcesso,
} from 'src/app/shared/models/assunto-processo.model';

@Component({
  selector: 'top-assunto-processo-atualizar',
  templateUrl: './assunto-processo-atualizar.component.html',
})
export class AssuntoProcessoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Assunto do Processo';
  acao: string = 'Criar';
  assuntoProcesso?: IAssuntoProcesso;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  isModal: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.assuntoProcesso?.id],
    //codigo: ['', [Validators.required]],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    nomeCompleto: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(200)],
    ],
  });

  constructor(
    private assuntoProcessoService: AssuntoProcessoService,
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
        this.consultarAssuntoProcesso$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarAssuntoProcesso$(id: number): void {
    this.inscricaoConsulta = this.assuntoProcessoService
      .consultarAssuntoProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.assuntoProcesso = corpo.data;
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
      id: this.assuntoProcesso?.id,
      //codigo: this.assuntoProcesso?.codigo,
      nome: this.assuntoProcesso?.nome,
      nomeCompleto: this.assuntoProcesso?.nomeCompleto,
    });
    if (this.assuntoProcesso != null) this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    if (this.isModal) {
      this.ref.close();
    } else {
      this.router.navigate(['assunto-processo']);
    }
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const assuntoProcesso = this.criarFormulario();

      if (assuntoProcesso.id === undefined) {
        this.chamarServico(
          this.assuntoProcessoService.incluirAssuntoProcesso(assuntoProcesso),
          'criado'
        );
      } else {
        this.chamarServico(
          this.assuntoProcessoService.atualizarAssuntoProcesso(assuntoProcesso),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): IAssuntoProcesso {
    return {
      ...new AssuntoProcesso(),
      id: this.editForm.get(['id'])!.value || undefined,
      //codigo: this.editForm.get(['codigo'])!.value,
      codigo: '0',
      nome: this.editForm.get(['nome'])!.value,
      nomeCompleto: this.editForm.get(['nomeCompleto'])!.value,
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
