import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IFuncao } from 'src/app/shared/models/funcao.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class FuncaoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarFuncoes(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/funcao?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarFuncao(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/funcao/${id}`, {
      observe: 'response',
    });
  }

  incluirFuncao(funcao: IFuncao): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(`${this.API_URL}/funcao`, funcao, {
      observe: 'response',
    });
  }

  atualizarFuncao(funcao: IFuncao): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/funcao/${funcao.id}`,
      funcao,
      {
        observe: 'response',
      }
    );
  }

  excluirFuncao(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/funcao/${id}`, {
      observe: 'response',
    });
  }
}
