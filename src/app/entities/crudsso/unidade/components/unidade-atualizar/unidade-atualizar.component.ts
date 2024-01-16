import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { UnidadeService } from '../../unidade.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUnidade, Unidade } from 'src/app/shared/models/unidade.model';

@Component({
  selector: 'top-unidade-atualizar',
  templateUrl: './unidade-atualizar.component.html',
})
export class UnidadeAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Unidade';
  acao: string = 'Criar';
  unidade?: IUnidade;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;

  salvando = false;
  editForm = this.fb.group({
    id: [this.unidade?.id],
    clienteId: [],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
    ativo: [true, Validators.required],
  });

  constructor(
    protected unidadeService: UnidadeService,
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
        this.consultarUnidade$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarUnidade$(id: number): void {
    this.inscricaoConsulta = this.unidadeService
      .consultarUnidade(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body!;
          this.unidade = corpo.data || [];
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
      id: this.unidade?.id,
      nome: this.unidade?.nome,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['unidade']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const unidade = this.criarFormulario();

      if (unidade.id === undefined) {
        this.chamarServico(
          this.unidadeService.incluirUnidade(unidade),
          'criada'
        );
      } else {
        this.chamarServico(
          this.unidadeService.atualizarUnidade(unidade),
          'atualizada'
        );
      }
    }
  }

  private criarFormulario(): IUnidade {
    return {
      ...new Unidade(),
      id: this.editForm.get(['id'])!.value,
      nome: this.editForm.get(['nome'])!.value,
      ativo: this.editForm.get(['ativo'])!.value,
    };
  }

  protected chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>,
    acao: string
  ): void {
    this.inscricaoServico = resultado.subscribe({
      complete: () => this.salvarSucesso(acao),
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  protected salvarSucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${this.recipiente} ${acao} com sucesso.`,
    ]);
    this.router.navigate(['unidade']);
    this.salvando = false;
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
