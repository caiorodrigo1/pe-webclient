import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { IEntidade } from '../models/entidade-response.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly API_URL = `${config['authUrl']}`;

  constructor(private httpClient: HttpClient) {}

  public consultarClientesTop(): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<any>(`${this.API_URL}/clientes`, {
      observe: 'response',
    });
  }
}
