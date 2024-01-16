import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ICargo } from 'src/app/shared/models/cargo.model';

type Resposta = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class CargoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarCargos(requisicao?: any): Observable<Resposta> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/cargo?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarCargo(id: number): Observable<Resposta> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/cargo/${id}`, {
      observe: 'response',
    });
  }

  incluirCargo(cargo: ICargo): Observable<Resposta> {
    return this.httpClient.post<IEntidade>(`${this.API_URL}/cargo`, cargo, {
      observe: 'response',
    });
  }

  atualizarCargo(cargo: ICargo): Observable<Resposta> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/cargo/${cargo.id}`,
      cargo,
      {
        observe: 'response',
      }
    );
  }

  excluirCargo(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/cargo/${id}`, {
      observe: 'response',
    });
  }
}
