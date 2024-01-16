import { Routes } from '@angular/router';

import { SetorComponent } from './container/setor.component';
import { SetorAtualizarComponent } from './components/setor-atualizar/setor-atualizar.component';

export const setorRoute: Routes = [
  {
    path: '',
    component: SetorComponent,
    data: { pageTitle: 'Setor' },
  },
  {
    path: 'criar',
    component: SetorAtualizarComponent,
    data: { pageTitle: 'Criar Setor' },
  },
  {
    path: 'editar/:id',
    component: SetorAtualizarComponent,
    data: { pageTitle: 'Editar Setor' },
  },
];
