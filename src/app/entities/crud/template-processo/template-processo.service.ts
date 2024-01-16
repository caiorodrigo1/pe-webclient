import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITemplateProcesso } from 'src/app/shared/models/template-processo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TemplateProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarTemplatesProcesso(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-processo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarTemplateProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirTemplateProcesso(
    templateProcesso: ITemplateProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/template-processo`,
      templateProcesso,
      {
        observe: 'response',
      }
    );
  }

  atualizarTemplateProcesso(
    templateProcesso: ITemplateProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/template-processo/${templateProcesso.id}`,
      templateProcesso,
      {
        observe: 'response',
      }
    );
  }

  excluirTemplateProcesso(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/template-processo/${id}`, {
      observe: 'response',
    });
  }

  consultarTemplateProcessoByTipoProcesso(
    tipoProcessoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-processo/obter-por-tipo-processo/${tipoProcessoId}`,
      {
        observe: 'response',
      }
    );
  }
}
