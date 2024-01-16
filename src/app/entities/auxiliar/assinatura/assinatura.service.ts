import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IDocumentoAssinatura } from 'src/app/shared/models/documento-assinatura.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class AssinaturaService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;
  private readonly tam = 10;

  constructor(private httpClient: HttpClient) {}

  consultarAssinaturaRecebidas(): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/assinatura/recebidas?pageSize=${this.tam}&pageIndex=1`,
      {
        observe: 'response',
      }
    );
  }

  consultarAssinaturaEnviadas(): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/assinatura/enviadas?pageSize=${this.tam}&pageIndex=1`,
      {
        observe: 'response',
      }
    );
  }

  consultarAssinaturasAnexo(): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(`${this.API_URL}/anexo/assinatura`, {
      observe: 'response',
    });
  }

  consultarAssinaturasDocumento(): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/documento/assinatura`,
      {
        observe: 'response',
      }
    );
  }

  visualizarAssinaturas(id: number): Observable<RespostaTipoEntidade> {
    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/assinatura/visualizar/${id}`,
      {
        observe: 'response',
      }
    );
  }

  assinarAnexo(
    assinatura: IDocumentoAssinatura
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/assinatura/assinar/anexo`,
      assinatura,
      {
        observe: 'response',
      }
    );
  }

  assinarDocumento(
    assinatura: IDocumentoAssinatura
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/assinatura/assinar/documento`,
      assinatura,
      {
        observe: 'response',
      }
    );
  }

  rejeitarAnexo(
    request: IDocumentoAssinatura
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/assinatura/rejeitar/anexo`,
      request,
      {
        observe: 'response',
      }
    );
  }

  rejeitarDocumento(
    request: IDocumentoAssinatura
  ): Observable<RespostaTipoEntidade> {
    return this.httpClient.put<IEntidade>(
      `${this.API_URL}/assinatura/rejeitar/documento`,
      request,
      {
        observe: 'response',
      }
    );
  }
}
