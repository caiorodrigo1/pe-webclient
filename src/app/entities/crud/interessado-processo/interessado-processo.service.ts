import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IInteressadoProcesso } from 'src/app/shared/models/interessado-processo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class InteressadoProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarInteressadosProcesso(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/interessado-processo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarInteressadoProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/interessado-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirInteressadoProcesso(
    interessadoProcesso: IInteressadoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/interessado-processo`,
      interessadoProcesso,
      {
        observe: 'response',
      }
    );
  }

  atualizarInteressadoProcesso(
    interessadoProcesso: IInteressadoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/interessado-processo/${interessadoProcesso.id}`,
      interessadoProcesso,
      {
        observe: 'response',
      }
    );
  }

  excluirInteressadoProcesso(id: number): Observable<{}> {
    return this.httpClient.delete(
      `${this.API_URL}/interessado-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }
}
