import { Routes } from '@angular/router';

import { InstituicaoExternaComponent } from './containers/instituicao-externa.component';
import { InstituicaoExternaAtualizarComponent } from './components/instituicao-externa-atualizar/instituicao-externa-atualizar.component';

export const instituicaoExternaRoute: Routes = [
  {
    path: '',
    component: InstituicaoExternaComponent,
    data: { pageTitle: 'Instituição Externa' },
  },
  {
    path: 'criar',
    component: InstituicaoExternaAtualizarComponent,
    data: { pageTitle: 'Criar Instituição Externa' },
  },
  {
    path: 'editar/:id',
    component: InstituicaoExternaAtualizarComponent,
    data: { pageTitle: 'Editar Instituição Externa' },
  },
];
