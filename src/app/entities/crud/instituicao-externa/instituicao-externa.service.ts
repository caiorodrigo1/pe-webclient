import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IInstituicaoExterna } from 'src/app/shared/models/instituicao-externa.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class InstituicaoExternaService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarInstituicoesExternas(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/instituicao-externa?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarInstituicaoExterna(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/instituicao-externa/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirInstituicaoExterna(
    instituicaoExterna: IInstituicaoExterna
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/instituicao-externa`,
      instituicaoExterna,
      {
        observe: 'response',
      }
    );
  }

  atualizarInstituicaoExterna(
    instituicaoExterna: IInstituicaoExterna
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/instituicao-externa/${instituicaoExterna.id}`,
      instituicaoExterna,
      {
        observe: 'response',
      }
    );
  }

  excluirInstituicaoExterna(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/instituicao-externa/${id}`, {
      observe: 'response',
    });
  }
}
