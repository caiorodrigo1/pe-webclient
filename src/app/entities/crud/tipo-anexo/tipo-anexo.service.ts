import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoAnexo } from 'src/app/shared/models/tipo-anexo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TipoAnexoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarTipoAnexos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/tipo-anexo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarTipoAnexo(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/tipo-anexo/${id}`, {
      observe: 'response',
    });
  }

  incluirTipoAnexo(tipoAnexo: ITipoAnexo): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tipo-anexo`,
      tipoAnexo,
      {
        observe: 'response',
      }
    );
  }

  atualizarTipoAnexo(tipoAnexo: ITipoAnexo): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/tipo-anexo/${tipoAnexo.id}`,
      tipoAnexo,
      {
        observe: 'response',
      }
    );
  }

  excluirTipoAnexo(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/tipo-anexo/${id}`, {
      observe: 'response',
    });
  }
}
