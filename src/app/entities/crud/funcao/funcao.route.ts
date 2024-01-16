import { Routes } from '@angular/router';

import { ComponentGuard } from 'src/app/auth/guards/component.guard';
import { FuncaoComponent } from './containers/funcao.component';
import { FuncaoAtualizarComponent } from './components/funcao-atualizar/funcao-atualizar.component';

export const funcaoRoute: Routes = [
  {
    path: '',
    component: FuncaoComponent,
    data: { pageTitle: 'Função' },
  },
  {
    path: 'criar',
    component: FuncaoAtualizarComponent,
    data: { pageTitle: 'Criar Função' },
  },
  {
    path: 'editar/:id',
    component: FuncaoAtualizarComponent,
    data: { pageTitle: 'Editar Função' },
  },
];
