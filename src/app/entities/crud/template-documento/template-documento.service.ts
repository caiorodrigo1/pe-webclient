import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITemplateDocumento } from 'src/app/shared/models/template-documento.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TemplateDocumentoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarTemplatesDocumento(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    const tam = 50;
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-documento?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarTemplateDocumento(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-documento/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirTemplateDocumento(
    templateDocumento: ITemplateDocumento
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/template-documento`,
      templateDocumento,
      {
        observe: 'response',
      }
    );
  }

  atualizarTemplateDocumento(
    templateDocumento: ITemplateDocumento
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/template-documento/${templateDocumento.id}`,
      templateDocumento,
      {
        observe: 'response',
      }
    );
  }

  excluirTemplateDocumento(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/template-documento/${id}`, {
      observe: 'response',
    });
  }

  consultarTemplateDocumentoByTipoDocumento(
    tipoDocumentoId: number
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/template-documento/obter-por-tipo-documento/${tipoDocumentoId}`,
      {
        observe: 'response',
      }
    );
  }
}
