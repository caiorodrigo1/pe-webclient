import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

import { CreateGuidService } from 'src/app/shared/services/create-guid.service';
import { config } from 'src/app/core/config/config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly API_URL = `${config['apiUrl']}`;

  constructor(private createGuidService: CreateGuidService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !request ||
      !request.url ||
      (request.url.startsWith('http') &&
        !(this.API_URL && request.url.startsWith(this.API_URL)))
    ) {
      return next.handle(request);
    }

    const token =
      localStorage.getItem('authenticationToken') ||
      sessionStorage.getItem('authenticationToken');

    const setorData =
      localStorage.getItem('setor') || sessionStorage.getItem('setor');
    const setor = setorData ? JSON.parse(setorData) : {};

    const guid = this.createGuidService.newGuid();

    if (token) {
      request = request.clone({
        headers: request.headers
          .append('Authorization', `Bearer ${token}`)
          .append('x-setor-id', `${setor.id ?? ''}`)
          .append('x-correlation-id', guid),
      });
    }

    return next.handle(request);
  }
}
