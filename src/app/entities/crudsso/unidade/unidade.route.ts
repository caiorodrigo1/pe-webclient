import { Routes } from '@angular/router';

import { UnidadeComponent } from './container/unidade.component';
import { UnidadeAtualizarComponent } from './components/unidade-atualizar/unidade-atualizar.component';

export const unidadeRoute: Routes = [
  {
    path: '',
    component: UnidadeComponent,
    data: { pageTitle: 'Unidade' },
  },
  {
    path: 'criar',
    component: UnidadeAtualizarComponent,
    data: { pageTitle: 'Criar Unidade' },
  },
  {
    path: 'editar/:id',
    component: UnidadeAtualizarComponent,
    data: { pageTitle: 'Editar Unidade' },
  },
];
