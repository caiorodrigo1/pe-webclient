import { Routes } from '@angular/router';

import { PermissaoAtualizarComponent } from './components/permissao-atualizar/permissao-atualizar.component';
import { PermissaoComponent } from './container/permissao.component';

export const permissaoRoute: Routes = [
  {
    path: '',
    component: PermissaoComponent,
    data: { pageTitle: 'Permissões do Usuário' },
  },
  {
    path: 'criar',
    component: PermissaoAtualizarComponent,
    data: { pageTitle: 'Criar Permissões do Usuário' },
  },
  {
    path: 'editar/:id',
    component: PermissaoAtualizarComponent,
    data: { pageTitle: 'Editar Permissões do Usuário' },
  },
];
