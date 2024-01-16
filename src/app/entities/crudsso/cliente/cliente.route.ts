import { Routes } from '@angular/router';

import { ComponentGuard } from 'src/app/auth/guards/component.guard';
import { ClienteComponent } from './container/cliente.component';
import { ClienteAtualizarComponent } from './components/cliente-atualizar/cliente-atualizar.component';

export const clienteRoute: Routes = [
  {
    path: '',
    component: ClienteComponent,
    data: { pageTitle: 'Cliente' },
    canActivate: [ComponentGuard],
  },
  {
    path: 'criar',
    component: ClienteAtualizarComponent,
    data: { pageTitle: 'Criar Cliente' },
    canActivate: [ComponentGuard],
  },
  {
    path: 'editar/:id',
    component: ClienteAtualizarComponent,
    data: { pageTitle: 'Editar Cliente' },
    canActivate: [ComponentGuard],
  },
];
