import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class OrgaoService {
  private readonly API_URL = `${config['apiUrl']}/sso`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarOrgaos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/orgao?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarOrgao(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/orgao/${id}`, {
      observe: 'response',
    });
  }

  incluirOrgao(orgao: IOrgao): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(`${this.API_URL}/orgao`, orgao, {
      observe: 'response',
    });
  }

  atualizarOrgao(orgao: IOrgao): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/orgao/${orgao.id}`,
      orgao,
      {
        observe: 'response',
      }
    );
  }

  excluirOrgao(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/orgao/${id}`, {
      observe: 'response',
    });
  }
}
