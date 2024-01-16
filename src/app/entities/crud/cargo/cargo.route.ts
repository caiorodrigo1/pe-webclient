import { Routes } from '@angular/router';

import { CargoComponent } from './containers/cargo.component';
import { CargoAtualizarComponent } from './components/cargo-atualizar/cargo-atualizar.component';

export const cargoRoute: Routes = [
  {
    path: '',
    component: CargoComponent,
    data: { pageTitle: 'Cargo' },
  },
  {
    path: 'criar',
    component: CargoAtualizarComponent,
    data: { pageTitle: 'Criar Cargo' },
  },
  {
    path: 'editar/:id',
    component: CargoAtualizarComponent,
    data: { pageTitle: 'Editar Cargo' },
  },
];
