import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { Uf } from 'src/app/shared/enums/uf.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IMunicipio, Municipio } from 'src/app/shared/models/municipio.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class MunicipioService {
  private readonly API_URL = `${config['apiUrl']}/sso`;
  private readonly tam = 500;

  //--------------------------
  municipios: Municipio[] = [
    {
      id: 1,
      nome: 'cidade 1',
      codigoIbge: 'cod1',
      uf: Uf.AL,
    },
    {
      id: 2,
      nome: 'cidade 2',
      codigoIbge: 'cod2',
      uf: Uf.RN,
    },
    {
      id: 3,
      nome: 'cidade 3',
      codigoIbge: 'cod3',
      uf: Uf.PE,
    },
  ];

  resp: IEntidade[] = [
    {
      statusCode: 200,
      data: this.municipios,
    },
  ];

  //---------------------------

  constructor(private httpClient: HttpClient) {}

  consultarMunicipios(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/municipio?pageSize=${this.tam}&pageIndex=1`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  // consultarMunicipios(requisicao?: any): Observable<RespostaTipoEntidadeLista> {
  //   const headers = new HttpHeaders();
  //   headers.set('Content-Type', 'application/json');

  //   const httpResponse = new HttpResponse<IEntidade[]>({
  //     body: this.resp,
  //   });
  //   return of(httpResponse).pipe(
  //     map((response) => {
  //       return new HttpResponse<IEntidade[]>({
  //         body: response.body,
  //         status: 200,
  //         headers: headers,
  //       });
  //     })
  //   );
  // }

  consultarMunicipio(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/municipio/${id}`, {
      observe: 'response',
    });
  }

  incluirMunicipio(municipio: IMunicipio): Observable<RespostaTipoEntidade> {
    return this.httpClient.post<IEntidade>(
      `${this.API_URL}/municipio`,
      municipio,
      {
        observe: 'response',
      }
    );
  }

  atualizarMunicipio(municipio: IMunicipio): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/municipio/${municipio.id}`,
      municipio,
      {
        observe: 'response',
      }
    );
  }

  excluirMunicipio(id: number): Observable<{}> {
    return this.httpClient.delete(`${this.API_URL}/municipio/${id}`, {
      observe: 'response',
    });
  }
}
