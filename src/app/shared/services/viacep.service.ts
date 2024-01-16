import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IEndereco } from '../models/endereco.model';

@Injectable({
  providedIn: 'root',
})
export class ViacepService {
  private readonly URL = `https://viacep.com.br`;

  constructor(private httpClient: HttpClient) {}

  consultarCep(cep: string): Observable<any> {
    return this.httpClient.get<IEndereco>(`${this.URL}/ws/${cep}/json`, {
      observe: 'response',
    });
  }
}
