import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class ValidacaoDocumentoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;

  constructor(private httpClient: HttpClient) {}

  buscarDocumentoValidado(
    codigo: string,
    crc: string,
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<any>(
      `${this.API_URL}/validar?identificacao=${codigo}&autenticacao=${crc}`,
      {
        params: options,
        observe: 'response',
      }
    );
  }
}
