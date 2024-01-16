import { Routes } from '@angular/router';

import { HipoteseLegalComponent } from './containers/hipotese-legal.component';
import { HipoteseLegalAtualizarComponent } from './components/hipotese-legal-atualizar/hipotese-legal-atualizar.component';

export const hipoteseLegalRoute: Routes = [
  {
    path: '',
    component: HipoteseLegalComponent,
    data: { pageTitle: 'Hipótese Legal (LGPD)' },
  },
  {
    path: 'criar',
    component: HipoteseLegalAtualizarComponent,
    data: { pageTitle: 'Criar Hipótese Legal (LGPD)' },
  },
  {
    path: 'editar/:id',
    component: HipoteseLegalAtualizarComponent,
    data: { pageTitle: 'Editar Hipótese Legal (LGPD)' },
  },
];
