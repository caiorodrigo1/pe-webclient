import { Routes } from '@angular/router';

import { OrgaoComponent } from './container/orgao.component';
import { OrgaoAtualizarComponent } from './components/orgao-atualizar/orgao-atualizar.component';

export const orgaoRoute: Routes = [
  {
    path: '',
    component: OrgaoComponent,
    data: { pageTitle: 'Orgao' },
  },
  {
    path: 'criar',
    component: OrgaoAtualizarComponent,
    data: { pageTitle: 'Criar Orgao' },
  },
  {
    path: 'editar/:id',
    component: OrgaoAtualizarComponent,
    data: { pageTitle: 'Atualizar Orgao' },
  },
];
