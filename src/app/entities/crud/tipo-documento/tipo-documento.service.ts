import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoDocumento } from 'src/app/shared/models/tipo-documento.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TipoDocumentoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;
  constructor(private httpClient: HttpClient) {}

  consultarTiposDocumento(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/tipo-documento?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarTipoDocumento(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/tipo-documento/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirTipoDocumento(
    tipodocumento: ITipoDocumento
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tipo-documento`,
      tipodocumento,
      {
        observe: 'response',
      }
    );
  }

  atualizarTipoDocumento(
    tipodocumento: ITipoDocumento
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/tipo-documento/${tipodocumento.id}`,
      tipodocumento,
      {
        observe: 'response',
      }
    );
  }

  excluirTipoDocumento(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/tipo-documento/${id}`, {
      observe: 'response',
    });
  }
}
