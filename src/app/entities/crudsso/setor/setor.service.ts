import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ISetor } from 'src/app/shared/models/setor.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;
type RespostaTipoEntidadeLista = HttpResponse<IEntidade[]>;

@Injectable({
  providedIn: 'root',
})
export class SetorService {
  private readonly API_URL = `${config['apiUrl']}/sso`;
  private readonly tam = 500;

  constructor(private httpClient: HttpClient) {}

  consultarSetores(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/setor?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  consultarSetor(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/setor/${id}`, {
      observe: 'response',
    });
  }

  incluirSetor(setor: ISetor): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(`${this.API_URL}/setor`, setor, {
      observe: 'response',
    });
  }

  atualizarSetor(setor: ISetor): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/setor/${setor.id}`,
      setor,
      { observe: 'response' }
    );
  }

  excluirSetor(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/setor/${id}`, {
      observe: 'response',
    });
  }

  consultarOrgaoByTenant(orgao: IOrgao): Observable<RespostaTipoEntidadeLista> {
    return this.httpClient.get<IEntidade[]>(
      `${this.API_URL}/orgao/externo/tenant?tenant=${orgao.tenant}`,
      {
        observe: 'response',
      }
    );
  }
}
