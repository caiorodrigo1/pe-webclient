import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { catchError, map, Observable, of, tap } from 'rxjs';

import { StorageService } from 'src/app/shared/services/storage.service';
import { config } from 'src/app/core/config/config';
import {
  LoginRequest,
  RefreshRequest,
} from 'src/app/shared/models/login-request.model';
import { IUsuarioToken } from 'src/app/shared/models/account.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({ providedIn: 'root' })
export class AutorizaService {
  private readonly API_URL = `${config['authUrl']}`;

  constructor(
    private storageService: StorageService,
    private httpClient: HttpClient,
    private router: Router
  ) {}

  public conectar$(
    credenciais: LoginRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient
      .post<IEntidade>(`${this.API_URL}/login`, credenciais, {
        observe: 'response',
      })
      .pipe(
        tap((response) =>
          this.autenticadoSucesso(
            response.body,
            credenciais.clienteId,
            credenciais.rememberMe
          )
        ),
        map((response) => response)
      );
  }

  private autenticadoSucesso(
    resposta: IEntidade | null,
    clienteId: number,
    rememberMe: boolean
  ): void {
    if (resposta) {
      const jwt = resposta.data.token;
      const id = resposta.data.id;
      const nome = resposta.data.nome;
      const nomeCliente = resposta.data.nomeCliente;
      const idCliente = clienteId.toString();
      const clienteIdentificador = resposta.data.identificadorCliente;
      const identificadorUsuario = resposta.data.identificador;
      const logo = resposta.data.logo;

      let storage = 'session';
      if (rememberMe) storage = 'local';

      this.storageService.gravarItem(storage, 'authenticationToken', jwt);
      this.storageService.gravarItem(storage, 'id', id);
      this.storageService.gravarItem(storage, 'nome', nome);
      this.storageService.gravarItem(storage, 'cliente', nomeCliente);
      this.storageService.gravarItem(storage, 'clienteId', idCliente);
      this.storageService.gravarItem(storage, 'logo', logo);
      this.storageService.gravarItem(
        storage,
        'identificadorCliente',
        clienteIdentificador
      );
      this.storageService.gravarItem(
        storage,
        'identificadorUsuario',
        identificadorUsuario
      );
    }
  }

  public regerarToken(
    request: RefreshRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient
      .post<IEntidade>(`${this.API_URL}/token`, request, {
        observe: 'response',
      })
      .pipe(
        tap((response) =>
          this.tokenRegeradoSucesso(response.body, false, request)
        ),
        map((response) => response)
      );
  }

  private tokenRegeradoSucesso(
    resposta: IEntidade | null,
    rememberMe: boolean,
    request: RefreshRequest
  ): void {
    if (resposta) {
      const token = resposta.data.token || '';
      const setores = request.metadata.setores || [];
      const setoresString = JSON.stringify(setores);
      const setor = JSON.stringify(setores[0]);

      let storage = 'session';
      if (rememberMe) storage = 'local';

      this.storageService.gravarItem(storage, 'authenticationToken', token);
      this.storageService.gravarItem(storage, 'setor', setor);
      this.storageService.gravarItem(storage, 'setores', setoresString);
    }
  }

  //retorna o objeto usuario decodificado pelo token ou false se der erro
  public consultarUsuarioAtual(): any {
    return this.consultarTokenUsuarioAtual().pipe(
      map((usuario) => usuario),
      catchError(() => of(false))
    );
  }

  private consultarTokenUsuarioAtual(): Observable<IUsuarioToken | undefined> {
    const token = this.consultarToken();
    if (token) {
      const encodedPayload = token.split('.')[1]; //pega o corpo do token ("cabeçalho.token.assinatura")
      const payload = window.atob(encodedPayload); //decodifica o corpo do token
      return of(JSON.parse(payload));
    } else {
      return of(undefined);
    }
  }

  private consultarToken(): string {
    return (
      localStorage.getItem('authenticationToken') ||
      sessionStorage.getItem('authenticationToken') ||
      ''
    );
  }

  //retorna true ou false a depender da existencia de um usuario
  public verificarJaLogado$(): Observable<boolean> {
    return this.consultarTokenUsuarioAtual().pipe(
      map((user) => !!user),
      catchError(() => of(false))
    );
  }

  public desconectar$(): void {
    this.limparCache$().subscribe({
      complete: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  private limparCache$(): Observable<void> {
    return new Observable((observer) => {
      localStorage.clear();
      sessionStorage.clear();
      observer.complete();
    });
  }
}
