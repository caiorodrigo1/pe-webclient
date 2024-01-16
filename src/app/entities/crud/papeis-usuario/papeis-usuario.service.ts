import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IPapeisUsuario } from 'src/app/shared/models/papeis-usuario.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class PapeisUsuarioService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarPapeisUsuarios(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/papeis-usuario?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarPapeisUsuario(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/papeis-usuario/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirPapeisUsuario(
    papeisUsuario: IPapeisUsuario
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/papeis-usuario`,
      papeisUsuario,
      {
        observe: 'response',
      }
    );
  }

  atualizarPapeisUsuario(
    papeisUsuario: IPapeisUsuario
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/papeis-usuario/${papeisUsuario.id}`,
      papeisUsuario,
      {
        observe: 'response',
      }
    );
  }

  excluirPapeisUsuario(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/papeis-usuario/${id}`, {
      observe: 'response',
    });
  }
}
