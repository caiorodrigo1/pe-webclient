import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IPermissao } from 'src/app/shared/models/permissao.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class PermissaoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarListaPermissoes(
    setorId: number,
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/usuario-setor?setorId=${setorId}?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarListaUsuariosPE(): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/usuario`, {
      observe: 'response',
    });
  }

  consultarPermissao(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/usuario-setor/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirPermissao(entidade: IPermissao): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/usuario-setor`,
      entidade,
      {
        observe: 'response',
      }
    );
  }

  atualizarPermissao(entidade: IPermissao): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/usuario-setor/${entidade.id}`,
      entidade,
      {
        observe: 'response',
      }
    );
  }

  excluirPermissao(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/usuario-setor/${id}`, {
      observe: 'response',
    });
  }
}
