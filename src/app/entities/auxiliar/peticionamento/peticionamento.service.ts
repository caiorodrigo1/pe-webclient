import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';

import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IPeticionamento,
  IPeticionamentoRequest,
} from 'src/app/shared/models/peticionamento.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class PeticionamentoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;

  constructor(private httpClient: HttpClient) {}

  consultarPeticionamentosAbertos(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    const tam = 50;
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/peticionamento/abertos/todos?pageSize=${tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarPeticionamentosConcluidos(
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    const tam = 50;
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/peticionamento/concluidos/todos?pageSize=${tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarPeticionamentos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    const tam = 50;
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/peticionamento?pageSize=${tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarPeticionamentoId(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/peticionamento/${id}`,
      {
        observe: 'response',
      }
    );
  }

  consultarPeticionamentoProtocolo(
    protocolo: string,
    tenant: string,
    idOrgao: string
  ): Observable<RespostaTipoEntidade> {
    const headers = new HttpHeaders({
      'x-identificador-orgao': idOrgao,
      'x-tenant': tenant,
    });
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/peticionamento/protocolo/${protocolo}`,
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  cadastrarPeticionamento(
    requisicao: IPeticionamentoRequest
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/peticionamento`,
      requisicao,
      {
        observe: 'response',
      }
    );
  }

  concluirPeticionamento(
    peticionamento: IPeticionamento
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/peticionamento/concluir`,
      peticionamento,
      {
        observe: 'response',
      }
    );
  }
}
