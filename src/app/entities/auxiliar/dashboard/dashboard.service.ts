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
export class DashboardService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico/dashboard`;

  constructor(private httpClient: HttpClient) {}

  dadosDashboard(
    setorId: string,
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);

    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/inicial?setorId=${setorId}`,
      {
        params: options,
        observe: 'response',
      }
    );
  }
}
