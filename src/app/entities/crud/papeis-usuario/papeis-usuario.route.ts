import { Routes } from '@angular/router';

import { PapeisUsuarioAtualizarComponent } from './components/papeis-usuario-atualizar/papeis-usuario-atualizar.component';
import { PapeisUsuarioComponent } from './container/papeis-usuario.component';

export const papeisUsuarioRoute: Routes = [
  {
    path: '',
    component: PapeisUsuarioComponent,
    data: { pageTitle: 'Papeis do Usuário' },
  },
  {
    path: 'criar',
    component: PapeisUsuarioAtualizarComponent,
    data: { pageTitle: 'Criar Papeis do Usuário' },
  },
  {
    path: 'editar/:id',
    component: PapeisUsuarioAtualizarComponent,
    data: { pageTitle: 'Editar Papeis do Usuário' },
  },
];
