import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ICliente } from 'src/app/shared/models/cliente.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly API_URL = `${config['apiUrl']}/sso`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarClientes(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/cliente?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarCliente(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/cliente/${id}`, {
      observe: 'response',
    });
  }

  incluirCliente(cliente: ICliente): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(`${this.API_URL}/cliente`, cliente, {
      observe: 'response',
    });
  }

  atualizarCliente(cliente: ICliente): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/cliente/${cliente.id}`,
      cliente,
      {
        observe: 'response',
      }
    );
  }

  excluirCliente(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/cliente/${id}`, {
      observe: 'response',
    });
  }
}
