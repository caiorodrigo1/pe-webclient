import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoProcesso } from 'src/app/shared/models/tipo-processo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TipoProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarTiposProcesso(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/tipo-processo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarTipoProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/tipo-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirTipoProcesso(
    tipoprocesso: ITipoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/tipo-processo`,
      tipoprocesso,
      {
        observe: 'response',
      }
    );
  }

  atualizarTipoProcesso(
    tipoprocesso: ITipoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/tipo-processo/${tipoprocesso.id}`,
      tipoprocesso,
      {
        observe: 'response',
      }
    );
  }

  excluirTipoProcesso(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/tipo-processo/${id}`, {
      observe: 'response',
    });
  }
}
