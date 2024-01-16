import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { TipoProcessoService } from '../../tipo-processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  ITipoProcesso,
  TipoProcesso,
} from 'src/app/shared/models/tipo-processo.model';

@Component({
  selector: 'top-tipo-processo-atualizar',
  templateUrl: './tipo-processo-atualizar.component.html',
})
export class TipoProcessoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Tipo de Processo';
  acao: string = 'Criar';
  tipoProcesso?: ITipoProcesso;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  isModal: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.tipoProcesso?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    tramitaMultSetor: ['', [Validators.required]],
  });

  constructor(
    private tipoProcessoService: TipoProcessoService,
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
        this.consultarTipoProcesso$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarTipoProcesso$(id: number): void {
    this.inscricaoConsulta = this.tipoProcessoService
      .consultarTipoProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.tipoProcesso = corpo!.data;
          this.atualizarFormulario();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.recipiente);
        },
      });
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.tipoProcesso?.id,
      nome: this.tipoProcesso?.nome,
      tramitaMultSetor: this.tipoProcesso?.tramitaMultSetor,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    if (this.isModal) {
      this.ref.close();
    } else {
      this.router.navigate(['tipo-processo']);
    }
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const tipoProcesso = this.criarFormulario();

      if (tipoProcesso.id === undefined) {
        this.chamarServico(
          this.tipoProcessoService.incluirTipoProcesso(tipoProcesso),
          'criado'
        );
      } else {
        this.chamarServico(
          this.tipoProcessoService.atualizarTipoProcesso(tipoProcesso),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ITipoProcesso {
    return {
      ...new TipoProcesso(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      tramitaMultSetor: this.traduzirValor(
        this.editForm.get(['tramitaMultSetor'])!.value
      ),
    };
  }

  private traduzirValor(valor: string): string {
    switch (valor) {
      case 'Sim':
        return '1';
      case 'Nao':
        return '2';
      case 'AoCriarProcesso':
        return '3';
      default:
        return '2';
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
