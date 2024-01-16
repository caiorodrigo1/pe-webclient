import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  objeto: any;

  public guardarObjeto(objeto: any): void {
    this.objeto = objeto;
  }

  public receberObjeto(): any {
    return this.objeto;
  }

  public limparObjeto(): void {
    this.objeto = null;
  }
}
