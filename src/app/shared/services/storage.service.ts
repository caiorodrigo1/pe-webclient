import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  LOCAL = 'local';
  SESSION = 'session';
  ANY = 'any';

  constructor() {}

  gravarItem(local: string, chave: string, valor: string): void {
    if (local === this.LOCAL) localStorage.setItem(chave, valor);
    if (local === this.SESSION) sessionStorage.setItem(chave, valor);
  }

  lerItem(local: string, chave: string): any {
    if (local === this.LOCAL) return localStorage.getItem(chave);
    if (local === this.SESSION) return sessionStorage.getItem(chave);
  }

  removerItem(local: string, chave: string): void {
    if (local === this.LOCAL) localStorage.removeItem(chave);
    if (local === this.SESSION) sessionStorage.removeItem(chave);
  }

  limparDados(local: string): void {
    if (local === this.LOCAL) localStorage.clear();
    if (local === this.SESSION) sessionStorage.clear();
  }
}
