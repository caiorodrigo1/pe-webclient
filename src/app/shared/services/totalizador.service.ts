import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { config } from 'src/app/core/config/config';
import { createRequestOption } from 'src/app/shared/util/request.util';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { StorageService } from './storage.service';
import { ITotalizador } from '../models/totalizador.model';

type RespostaTipoEntidade = HttpResponse<IEntidade>;

@Injectable({
  providedIn: 'root',
})
export class TotalizadorService {
  private readonly API_URL = `${config['apiUrl']}/processo-eletronico`;

  totalizador: ITotalizador = {
    criados: 0,
    enviados: 0,
    favoritos: 0,
    rascunhos: 0,
    recebidos: 0,
  };

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService
  ) {}

  consultarTotalizadores(requisicao?: any): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);
    const setor = JSON.parse(this.storageService.lerItem('session', 'setor'));

    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/processo/totalizador/todos?setorId=${setor.id}`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  buscarDadosDashboard(
    setorId: number,
    requisicao?: any
  ): Observable<RespostaTipoEntidade> {
    const options = createRequestOption(requisicao);

    return this.httpClient.get<IEntidade>(
      `${this.API_URL}/dashboard/inicial?setorId=${setorId}`,
      {
        params: options,
        observe: 'response',
      }
    );
  }

  private totalizadorBehavior = new BehaviorSubject<ITotalizador>(
    this.totalizador
  );

  public lerTotalizador(): BehaviorSubject<ITotalizador> {
    return this.totalizadorBehavior;
  }

  public escreverTotalizador(totalizador: ITotalizador): void {
    this.totalizadorBehavior.next(totalizador);
  }
}
