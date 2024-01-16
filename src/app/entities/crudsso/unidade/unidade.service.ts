import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUnidade } from 'src/app/shared/models/unidade.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;
type RespostaTipoEntidadeLista = HttpResponse<IEntidade[]>;

@Injectable({
  providedIn: 'root',
})
export class UnidadeService {
  private readonly API_URL = `${config['apiUrl']}/sso`;
  private readonly tam = 500;

  constructor(private httpCLient: HttpClient) {}

  consultarUnidades(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpCLient.get<IEntidade>(
      `${this.API_URL}/unidade?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarUnidade(id: number): Observable<RespostaTipoEntidade> {
    return this.httpCLient.get<IEntidade>(`${this.API_URL}/unidade/${id}`, {
      observe: 'response',
    });
  }

  incluirUnidade(unidade: IUnidade): Observable<RespostaTipoEntidade> {
    return this.httpCLient.post<IEntidade>(`${this.API_URL}/unidade`, unidade, {
      observe: 'response',
    });
  }

  atualizarUnidade(unidade: IUnidade): Observable<RespostaTipoEntidade> {
    return this.httpCLient.put<IEntidade>(
      `${this.API_URL}/unidade/${unidade.id}`,
      unidade,
      {
        observe: 'response',
      }
    );
  }

  excluirUnidade(id: number): Observable<{}> {
    return this.httpCLient.delete(`${this.API_URL}/unidade/${id}`, {
      observe: 'response',
    });
  }
}
