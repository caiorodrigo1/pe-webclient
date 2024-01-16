import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ValidaComponentService {
  private validado: boolean = false;

  liberar(liberacao: boolean) {
    this.validado = liberacao;
    return liberacao;
  }

  verificarLiberacao(): boolean {
    return this.validado;
  }
}
