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
export class OrgaoService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;

  constructor(private httpClient: HttpClient) {}

  consultarOrgaoAtual(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(`${this.API_URL}/orgao`, {
      params: options,
      observe: 'response',
    });
  }

  consultarSetoresPorOrgaoId(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/orgao/${id}/setores`,
      {
        observe: 'response',
      }
    );
  }

  consultarSetoresExternamente(
    id: number,
    tenant: string
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/orgao/externo/${id}/setores?tenant=${tenant}`,
      {
        observe: 'response',
      }
    );
  }

  consultarSetoresAtuais(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(`${this.API_URL}/orgao/setores`, {
      params: options,
      observe: 'response',
    });
  }

  consultarOrgaos(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(`${this.API_URL}/orgao/tenant`, {
      params: options,
      observe: 'response',
    });
  }

  consultarOrgaosExterno(tenant: string): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/orgao/externo/tenant?tenant=${tenant}`,
      {
        observe: 'response',
      }
    );
  }

  consultarUsuarios(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/usuario/orgao/${id}`,
      {
        observe: 'response',
      }
    );
  }

  consultarUsuariosPorSetorId(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/usuario/setor/${id}`,
      {
        observe: 'response',
      }
    );
  }
}
