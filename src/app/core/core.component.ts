import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { PrimeNGConfig } from 'primeng/api';

import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { AutorizaService } from 'src/app/auth/services/autoriza.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { TotalizadorService } from 'src/app/shared/services/totalizador.service';
import { TRADUCAOCONFIG } from '../shared/constants/config.constants';
import { CodigosErro } from '../shared/enums/codigos-erro.enum';
import { IEntidade } from '../shared/models/entidade-response.model';
import {
  IUsuarioLogado,
  UsuarioLogado,
} from '../shared/models/usuarioLogado.model';
import { ITotalizador, Totalizador } from '../shared/models/totalizador.model';

@Component({
  selector: 'top-core',
  templateUrl: './core.component.html',
})
export class CoreComponent implements OnInit, OnDestroy {
  usuarioLogado: IUsuarioLogado = new UsuarioLogado();
  totalizador: ITotalizador = new Totalizador();

  traducaoConfig = TRADUCAOCONFIG;

  inscricaoUsuarioLogado?: Subscription;
  inscricaoTotalizador?: Subscription;
  inscricaoOrgao!: Subscription;

  alternado: boolean = false;

  constructor(
    private orgaoService: OrgaoService,
    private autorizaService: AutorizaService,
    private storageService: StorageService,
    private exibirMensagemService: ExibirMensagemService,
    private usuarioLogadoService: UsuarioLogadoService,
    private totalizadorService: TotalizadorService,
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private config: PrimeNGConfig,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.atualizarTituloDaPagina();
    this.configurarTraducao();
    this.buscarUsuarioLogado();
    this.buscarTotalizadores();
  }

  ngOnDestroy(): void {
    if (this.inscricaoOrgao) this.inscricaoOrgao.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
  }

  private atualizarTituloDaPagina(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        const pageTitle = data['pageTitle'];
        if (pageTitle) {
          this.title.setTitle(pageTitle);
        }
      });
  }

  private buscarUsuarioLogado(): void {
    //Fazer busca pelo local depois
    const id = this.storageService.lerItem('session', 'id');
    const nome = this.storageService.lerItem('session', 'nome');
    const cliente = this.storageService.lerItem('session', 'cliente');
    const clienteId = this.storageService.lerItem('session', 'clienteId');
    const logo = this.storageService.lerItem('session', 'logo');
    const identificadorCliente = this.storageService.lerItem(
      'session',
      'identificadorCliente'
    );
    const identificadorUsuario = this.storageService.lerItem(
      'session',
      'identificadorUsuario'
    );
    const setor = this.storageService.lerItem('session', 'setor');
    const setores = this.storageService.lerItem('session', 'setores');

    if (
      id &&
      nome &&
      cliente &&
      clienteId &&
      identificadorCliente &&
      identificadorUsuario &&
      setores &&
      setor
    ) {
      this.usuarioLogado = new UsuarioLogado();

      this.usuarioLogado.id = id;
      this.usuarioLogado.nome = nome;
      this.usuarioLogado.cliente = cliente;
      this.usuarioLogado.clienteId = clienteId;
      this.usuarioLogado.logo = logo;
      this.usuarioLogado.identificadorCliente = identificadorCliente;
      this.usuarioLogado.identificadorUsuario = identificadorUsuario;
      this.usuarioLogado.setores = JSON.parse(setores);
      this.usuarioLogado.setor = JSON.parse(setor);

      this.usuarioLogadoService.escreverUsuarioLogado(this.usuarioLogado);
      this.buscarOrgao();
    } else {
      this.exibirErro('erro', 'Buscar', 'Usuário Logado');
      this.logout();
    }
  }

  private buscarOrgao(): void {
    this.inscricaoOrgao = this.orgaoService.consultarOrgaoAtual().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        const orgao = corpo!.data;
        this.usuarioLogado.orgao = orgao;
        this.usuarioLogadoService.escreverUsuarioLogado(this.usuarioLogado);
      },
      error: (resposta: HttpErrorResponse) => {
        const erro = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', 'Órgão');
        this.logout();
      },
    });
  }

  private buscarTotalizadores() {
    this.totalizador = new Totalizador();
    this.inscricaoTotalizador = this.totalizadorService
      .consultarTotalizadores()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          if (corpo) {
            this.totalizador.criados = corpo.data.criados;
            this.totalizador.enviados = corpo.data.enviados;
            this.totalizador.recebidos = corpo.data.recebidos;
            this.totalizador.rascunhos = corpo.data.rascunhos;
            this.totalizador.favoritos = corpo.data.favoritos;
            this.totalizadorService.escreverTotalizador(this.totalizador);
          }
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', 'Totalizadores');
        },
      });
  }

  private logout(): void {
    this.autorizaService.desconectar$();
  }

  protected alternarMenu() {
    const app = this.elementRef.nativeElement.querySelector('#app');
    if (this.alternado) {
      app.classList.remove('app-sidebar-mobile-toggled');
      this.alternado = false;
    } else {
      app.classList.add('app-sidebar-mobile-toggled');
      this.alternado = true;
    }
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem(
      'error',
      'Serviço de Mensagem',
      [erro],
      'app'
    );
  }

  private configurarTraducao(): void {
    this.config.setTranslation(this.traducaoConfig);
  }
}
