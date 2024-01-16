import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IHipoteseLegal } from 'src/app/shared/models/hipotese-legal.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class HipoteseLegalService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarHipotesesLegais(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/hipotese-legal?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarHipoteseLegal(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/hipotese-legal/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirHipoteseLegal(
    hipoteseLegal: IHipoteseLegal
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/hipotese-legal`,
      hipoteseLegal,
      {
        observe: 'response',
      }
    );
  }

  atualizarHipoteseLegal(
    hipoteseLegal: IHipoteseLegal
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/hipotese-legal/${hipoteseLegal.id}`,
      hipoteseLegal,
      {
        observe: 'response',
      }
    );
  }

  excluirHipoteseLegal(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/hipotese-legal/${id}`, {
      observe: 'response',
    });
  }
}
