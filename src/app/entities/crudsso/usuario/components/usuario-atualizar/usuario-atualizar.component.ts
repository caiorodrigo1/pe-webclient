import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { cpf } from 'cpf-cnpj-validator';

import { UsuarioService } from '../../usuario.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuario, Usuario } from 'src/app/shared/models/usuario.model';

@Component({
  selector: 'top-usuario-atualizar',
  templateUrl: './usuario-atualizar.component.html',
})
export class UsuarioAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Usuário';
  acao: string = 'Criar';
  usuario?: IUsuario;

  clienteId: number | undefined;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;
  inscricaoUsuarioLogado!: Subscription;

  carregando = true;
  salvando = false;

  editForm = this.fb.group({
    clienteId: [],
    id: [this.usuario?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
    cpf: ['', [Validators.required]],
    email: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
    senha: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
    ativo: [true, Validators.required],
  });

  constructor(
    private usuarioService: UsuarioService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buscarOrigem();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private buscarOrigem(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.clienteId = resposta.clienteId;
      });
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarUsuario(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarUsuario(id: number): void {
    this.inscricaoConsulta = this.usuarioService
      .consultarUsuario(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body!;
          this.usuario = corpo.data || [];
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
      id: this.usuario?.id,
      nome: this.usuario?.nome,
      cpf: this.usuario?.cpf!.replace(/\D/g, ''),
      email: this.usuario?.email,
      senha: this.usuario?.senha,
      ativo: this.usuario ? this.usuario?.ativo : true,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['usuario']);
  }

  protected testarValidadeCpf(palavra: string): void {
    if (!cpf.isValid(palavra) && palavra !== '') {
      this.editForm.get('cpf')!.setErrors({ invalid: true });
    }
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const usuario = this.criarFormulario();

      if (usuario.id === undefined) {
        this.chamarServico(
          this.usuarioService.incluirUsuario(usuario),
          'criada'
        );
      } else {
        this.chamarServico(
          this.usuarioService.atualizarUsuario(usuario),
          'atualizada'
        );
      }
    }
  }

  private criarFormulario(): IUsuario {
    return {
      ...new Usuario(),
      clienteId: Number(this.clienteId),
      id: this.editForm.get(['id'])!.value || undefined,
      cpf: this.editForm.get(['cpf'])!.value.replace(/\D/g, ''),
      nome: this.editForm.get(['nome'])!.value,
      email: this.editForm.get(['email'])!.value,
      senha: this.editForm.get(['senha'])!.value,
      ativo: this.editForm.get(['ativo'])!.value,
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
    this.router.navigate(['usuario']);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
