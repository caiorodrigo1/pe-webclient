import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ClienteService } from 'src/app/shared/services/cliente.service';
import { AutorizaService } from 'src/app/auth/services/autoriza.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
//import appSettings from 'src/app/shared/mocks/app-settings';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ICliente, Cliente } from 'src/app/shared/models/cliente.model';
import {
  LoginRequest,
  RefreshRequest,
} from 'src/app/shared/models/login-request.model';
import {
  IUsuarioLogado,
  UsuarioLogado,
} from 'src/app/shared/models/usuarioLogado.model';
import { IOrgao, Orgao } from 'src/app/shared/models/orgao.model';
import { ISetor } from 'src/app/shared/models/setor.model';

@Component({
  selector: 'top-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  clientes: ICliente[] = [];

  logoMarca: string = '/assets/img/logo/LogoTop.png';
  subtitulo: string = 'Desenvolvendo e otimizando soluções em TI desde 1993';
  bg: string = '';

  buscandoUsuario: boolean = false;
  entrando_sistema: boolean = false;
  autenticado: boolean = false;
  campos: boolean = true;

  usuario: IUsuarioLogado = new UsuarioLogado();
  orgaos: IOrgao[] = [];

  inscricaoAutorizacao: Subscription | null = null;
  inscricaoCliente: Subscription | null = null;

  loginForm: FormGroup;

  constructor(
    private autorizaService: AutorizaService,
    private clienteService: ClienteService,
    private exibirMensagemService: ExibirMensagemService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      cliente: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      senha: ['', [Validators.required]],
      orgao: [new Orgao()],
      rememberMe: [false],
    });
  }

  ngOnInit() {
    this.carregarClientes$();
    this.bg = '/assets/img/login-bg/login-bg-12.jpg';
    // this.bgList = [
    //   { bg: '/assets/img/login-bg/login-bg-17.jpg' },
    //   { bg: '/assets/img/login-bg/login-bg-16.jpg' },
    //   { bg: '/assets/img/login-bg/login-bg-15.jpg' },
    //   { bg: '/assets/img/login-bg/login-bg-14.jpg' },
    //   { bg: '/assets/img/login-bg/login-bg-13.jpg' },
    //   { bg: '/assets/img/login-bg/login-bg-12.jpg', active: true },
    // ];
  }

  ngOnDestroy(): void {
    //this.appSettings.appEmpty = false;
    if (this.inscricaoAutorizacao) this.inscricaoAutorizacao.unsubscribe();
    if (this.inscricaoCliente) this.inscricaoCliente.unsubscribe();
  }

  private carregarClientes$(): void {
    this.inscricaoCliente = this.clienteService
      .consultarClientesTop()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.clientes = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.clientes = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Clientes');
        },
      });
  }

  protected fazerLogin(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.exibirMensagemService.mensagem(
        'error',
        'Serviço de Mensagem',
        ['Preencha Todos os Campos do Formulário'],
        'app'
      );
      return;
    }

    this.buscandoUsuario = true;

    const clienteNome = this.loginForm.get('cliente')!.value?.nome;
    if (clienteNome === undefined) {
      this.exibirMensagem(['Cliente não foi selecionado']);
      this.buscandoUsuario = false;
      return;
    }

    const cpf = this.loginForm.get('cpf')!.value || '';
    if (cpf.trim().length === 0) {
      this.exibirMensagem(['CPF não foi preenchido']);
      this.buscandoUsuario = false;
      return;
    }

    const senha = this.loginForm.get('senha')!.value || '';
    if (senha.trim().length === 0) {
      this.exibirMensagem(['Senha não foi preenchida']);
      this.buscandoUsuario = false;
      return;
    }

    const clienteId = this.loginForm.get('cliente')!.value?.id;
    if (clienteId !== undefined && typeof clienteId === 'number') {
      const request = new LoginRequest(cpf, senha, clienteId, false);
      console.log(request);
      this.autenticar(request);
    } else {
      this.exibirMensagem(['Erro no Id do Cliente']);
    }
  }

  private autenticar(request: LoginRequest): void {
    this.inscricaoAutorizacao = this.autorizaService
      .conectar$(request)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          if (corpo) this.usuario = corpo.data;
          console.log('user:', this.usuario);
          this.orgaos = this.usuario.orgaos || [];
          this.autenticado = true;
          this.campos = false;
          this.buscandoUsuario = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.autenticado = false;
          this.buscandoUsuario = false;
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Autenticar', 'Usuário');
        },
      });
  }

  protected entrar_Sistema(): void {
    if (this.autenticado) {
      const orgao = this.loginForm.get('orgao')!.value?.sigla;
      if (orgao === undefined) {
        this.exibirMensagem(['Órgão não foi selecionado']);
        return;
      } else {
        if (this.usuario.setores !== undefined) {
          const identificador =
            this.loginForm.get('orgao')!.value?.identificadorOrgao || '';
          const metadata = {
            identificadorOrgao: identificador,
            setores: this.usuario.setores.filter(
              (setor: ISetor) => setor.identificadorOrgao === identificador
            ),
          };
          const request = new RefreshRequest(
            metadata,
            this.usuario.refreshToken || ''
          );
          this.regerarToken(request);
        }
      }
    }
  }

  private regerarToken(request: RefreshRequest): void {
    this.entrando_sistema = true;
    console.log('request: ', request);
    this.inscricaoAutorizacao = this.autorizaService
      .regerarToken(request)
      .subscribe({
        complete: () => {
          // this.router.navigate(['/processo/entrada']);
          this.router.navigate(['']);
          this.entrando_sistema = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Autenticar', 'Usuário');
          this.entrando_sistema = false;
        },
      });
  }

  private exibirErro(codigo: string, acao: string, entidade: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${entidade}`;
    this.exibirMensagemService.mensagem(
      'error',
      'Serviço de Mensagem',
      [erro],
      'login-form'
    );
  }

  private exibirMensagem(message: string[]): void {
    this.exibirMensagemService.mensagem(
      'error',
      'Serviço de Mensagem',
      message,
      'login-form'
    );
  }

  // changeBg(list: any): void {
  //   this.bg = list.bg;
  //   list.active = true;

  //   for (let bList of this.bgList) {
  //     if (bList != list) {
  //       bList.active = false;
  //     }
  //   }
  // }
}
