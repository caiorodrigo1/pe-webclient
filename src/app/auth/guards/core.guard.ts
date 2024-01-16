import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AutorizaService } from '../services/autoriza.service';

@Injectable({
  providedIn: 'root',
})
export class CoreGuard implements CanActivate {
  constructor(
    private autorizaService: AutorizaService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.autorizaService.consultarUsuarioAtual().subscribe({
      error: (resposta: any) => {
        this.falharAutenticacao(resposta);
      },
      next: (resposta: any) => {
        if (resposta == false || resposta == undefined) {
          this.falharAutenticacao(resposta);
          return of(false);
        } else {
          return of(true);
        }
      },
    });
  }

  private falharAutenticacao(resposta: any): void {
    console.log('Erro de autenticação: ', resposta);
    this.router.navigate(['/login']);
  }
}
