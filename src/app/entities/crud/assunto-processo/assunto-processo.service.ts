import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IAssuntoProcesso } from 'src/app/shared/models/assunto-processo.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class AssuntoProcessoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarAssuntosProcesso(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/assunto-processo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarAssuntoProcesso(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/assunto-processo/${id}`,
      {
        observe: 'response',
      }
    );
  }

  incluirAssuntoProcesso(
    assuntoProcesso: IAssuntoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/assunto-processo`,
      assuntoProcesso,
      {
        observe: 'response',
      }
    );
  }

  atualizarAssuntoProcesso(
    assuntoProcesso: IAssuntoProcesso
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/assunto-processo/${assuntoProcesso.id}`,
      assuntoProcesso,
      {
        observe: 'response',
      }
    );
  }

  excluirAssuntoProcesso(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/assunto-processo/${id}`, {
      observe: 'response',
    });
  }
}
