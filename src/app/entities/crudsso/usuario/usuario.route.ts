import { Routes } from '@angular/router';

import { UsuarioComponent } from './container/usuario.component';
import { UsuarioAtualizarComponent } from './components/usuario-atualizar/usuario-atualizar.component';

export const usuarioRoute: Routes = [
  {
    path: '',
    component: UsuarioComponent,
    data: { pageTitle: 'Usuário' },
  },
  {
    path: 'criar',
    component: UsuarioAtualizarComponent,
    data: { pageTitle: 'Criar Usuário' },
  },
  {
    path: 'editar/:id',
    component: UsuarioAtualizarComponent,
    data: { pageTitle: 'Editar Usuário' },
  },
];
