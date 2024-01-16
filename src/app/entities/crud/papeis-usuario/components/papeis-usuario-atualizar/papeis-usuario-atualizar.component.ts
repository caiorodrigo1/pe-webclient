import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { PapeisUsuarioService } from '../../papeis-usuario.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IPapeisUsuario,
  PapeisUsuario,
} from 'src/app/shared/models/papeis-usuario.model';

@Component({
  selector: 'top-papeis-usuario-atualizar',
  templateUrl: './papeis-usuario-atualizar.component.html',
})
export class PapeisUsuarioAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Papéis do Usuário';
  acao: string = 'Criar';
  papeisUsuario?: IPapeisUsuario;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.papeisUsuario?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    // coordenadorSetor: [false, Validators.required],
    criaProcesso: [false, Validators.required],
    alteraProcesso: [false, Validators.required],
    arquivaProcesso: [false, Validators.required],
    tramitaProcesso: [false, Validators.required],
    visualizaTramitacao: [false, Validators.required],
    visualizaSigiloso: [false, Validators.required],
    visualizaRestrito: [false, Validators.required],
  });

  constructor(
    protected papeisUsuarioService: PapeisUsuarioService,
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
        this.consultarPapelUsuario$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarPapelUsuario$(id: number): void {
    this.inscricaoConsulta = this.papeisUsuarioService
      .consultarPapeisUsuario(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.papeisUsuario = corpo!.data;
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
      id: this.papeisUsuario?.id,
      nome: this.papeisUsuario?.nome,
      // coordenadorSetor: this.papeisUsuario
      //   ? this.papeisUsuario?.coordenadorSetor
      //   : false,
      criaProcesso: this.papeisUsuario?.criaProcesso
        ? this.papeisUsuario?.criaProcesso
        : false,
      alteraProcesso: this.papeisUsuario?.alteraProcesso
        ? this.papeisUsuario?.alteraProcesso
        : false,
      arquivaProcesso: this.papeisUsuario?.arquivaProcesso
        ? this.papeisUsuario?.arquivaProcesso
        : false,
      tramitaProcesso: this.papeisUsuario?.tramitaProcesso
        ? this.papeisUsuario?.tramitaProcesso
        : false,
      visualizaTramitacao: this.papeisUsuario?.visualizaTramitacao
        ? this.papeisUsuario?.visualizaTramitacao
        : false,
      visualizaSigiloso: this.papeisUsuario?.visualizaSigiloso
        ? this.papeisUsuario?.visualizaSigiloso
        : false,
      visualizaRestrito: this.papeisUsuario?.visualizaRestrito
        ? this.papeisUsuario?.visualizaRestrito
        : false,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['papeis-usuario']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const papeisUsuario = this.criarFormulario();

      if (papeisUsuario.id === undefined) {
        this.chamarServico(
          this.papeisUsuarioService.incluirPapeisUsuario(papeisUsuario),
          'criado'
        );
      } else {
        this.chamarServico(
          this.papeisUsuarioService.atualizarPapeisUsuario(papeisUsuario),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): IPapeisUsuario {
    return {
      ...new PapeisUsuario(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      // coordenadorSetor: this.editForm.get(['coordenadorSetor'])!.value,
      criaProcesso: this.editForm.get(['criaProcesso'])!.value,
      alteraProcesso: this.editForm.get(['alteraProcesso'])!.value,
      arquivaProcesso: this.editForm.get(['arquivaProcesso'])!.value,
      tramitaProcesso: this.editForm.get(['tramitaProcesso'])!.value,
      visualizaTramitacao: this.editForm.get(['visualizaTramitacao'])!.value,
      visualizaSigiloso: this.editForm.get(['visualizaSigiloso'])!.value,
      visualizaRestrito: this.editForm.get(['visualizaRestrito'])!.value,
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
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
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
