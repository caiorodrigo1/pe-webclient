import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

import { AutorizaService } from '../services/autoriza.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private autorizaService: AutorizaService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.autorizaService.verificarJaLogado$().pipe(
      tap((logado) => {
        if (logado) {
          this.router.navigate(['']);
        }
      }),
      map((logado) => !logado)
    );
  }
}
