import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico/auditoria`;

  constructor(private httpClient: HttpClient) {}

  pesquisarAuditoria(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    const tam = 50;
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/pesquisa/interna?pageSize=${tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarAuditoria(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/${id}`, {
      observe: 'response',
    });
  }

  pesquisaInterna(
    filtros: Map<string, string>
  ): Observable<RespostaTipoEntidade> {
    let queryString = '';
    let count = 1;

    filtros.forEach((value, key) => {
      if (value !== '') {
        if (count === 1) {
          queryString += `?${key}=${value}`;
        } else {
          queryString += `&${key}=${value}`;
        }
        count++;
      }
    });
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/pesquisa/interna${queryString}`,
      {
        observe: 'response',
      }
    );
  }
}
