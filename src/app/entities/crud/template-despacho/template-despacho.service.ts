import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITemplateDespacho } from 'src/app/shared/models/template-despacho.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TemplateDespachoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarTemplatesDespacho(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-despacho?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarTemplateDespacho(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-despacho/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirTemplateDespacho(
    templateDespacho: ITemplateDespacho
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/template-despacho`,
      templateDespacho,
      {
        observe: 'response',
      }
    );
  }

  atualizarTemplateDespacho(
    templateDespacho: ITemplateDespacho
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/template-despacho/${templateDespacho.id}`,
      templateDespacho,
      {
        observe: 'response',
      }
    );
  }

  excluirTemplateDespacho(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/template-despacho/${id}`, {
      observe: 'response',
    });
  }
}
