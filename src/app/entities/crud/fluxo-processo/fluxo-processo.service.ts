import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IFluxoProcesso } from 'src/app/shared/models/fluxo-processo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class FluxoProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarFluxos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/fluxo-processo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarFluxoProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/fluxo-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirFluxoProcesso(
    fluxoProcesso: IFluxoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/fluxo-processo`,
      fluxoProcesso,
      {
        observe: 'response',
      }
    );
  }

  atualizarFluxoProcesso(
    fluxoProcesso: IFluxoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/fluxo-processo/${fluxoProcesso.id}`,
      fluxoProcesso,
      {
        observe: 'response',
      }
    );
  }

  excluirFluxoProcesso(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/fluxo-processo/${id}`, {
      observe: 'response',
    });
  }

  excluirEtapa(id: number): Observable<{}> {
    return this.httpClient.delete(
      `${this.API_URL}/fluxo-processo/etapa/${id}`,
      {
        observe: 'response',
      }
    );
  }
}
