import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/internal/operators/tap';

import { AutorizaService } from '../services/autoriza.service';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
  constructor(private autorizaService: AutorizaService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        complete: () => {},
        error: (erro: HttpErrorResponse) => {
          if (
            erro.status === 401 &&
            erro.url &&
            !erro.url.includes('api/account')
          ) {
            this.autorizaService.desconectar$();
          }
        },
      })
    );
  }
}
