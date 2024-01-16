import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ISituacaoProcesso } from 'src/app/shared/models/situacao-processo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class SituacaoProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarSituacaoProcessos(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/situacao-processo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarSituacaoProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/situacao-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirSituacaoProcesso(
    situacaoProcesso: ISituacaoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/situacao-processo`,
      situacaoProcesso,
      {
        observe: 'response',
      }
    );
  }

  atualizarSituacaoProcesso(
    situacaoProcesso: ISituacaoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/situacao-processo/${situacaoProcesso.id}`,
      situacaoProcesso,
      {
        observe: 'response',
      }
    );
  }

  excluirSituacaoProcesso(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/situacao-processo/${id}`, {
      observe: 'response',
    });
  }

  // consultarSetorByIdentificadorOrgao(
  //   identificadorOrgao: string
  // ): Observable<RespostaTipoEntidade> {
  //   return this.httpClient.get<IEntidade>(
  //     `${this.API_URL}/situacao-processo/obter-por-identificador-orgao/${identificadorOrgao}`,
  //     {
  //       observe: 'response',
  //     }
  //   );
  // }
}
