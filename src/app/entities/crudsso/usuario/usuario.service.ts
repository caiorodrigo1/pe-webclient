import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuario } from 'src/app/shared/models/usuario.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly API_URL = `${config['apiUrl']}/sso`;
  private readonly tam = 500;

  constructor(private httpCLient: HttpClient) {}

  consultarUsuarios(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpCLient.get<IEntidade>(
      `${this.API_URL}/usuario?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarUsuario(id: number): Observable<RespostaTipoEntidade> {
    return this.httpCLient.get<IEntidade>(`${this.API_URL}/usuario/${id}`, {
      observe: 'response',
    });
  }

  incluirUsuario(usuario: IUsuario): Observable<RespostaTipoEntidade> {
    return this.httpCLient.post<IEntidade>(`${this.API_URL}/usuario`, usuario, {
      observe: 'response',
    });
  }

  atualizarUsuario(usuario: IUsuario): Observable<RespostaTipoEntidade> {
    return this.httpCLient.put<IEntidade>(
      `${this.API_URL}/usuario/${usuario.id}`,
      usuario,
      {
        observe: 'response',
      }
    );
  }

  excluirUsuario(id: number): Observable<{}> {
    return this.httpCLient.delete(`${this.API_URL}/usuario/${id}`, {
      observe: 'response',
    });
  }
}
