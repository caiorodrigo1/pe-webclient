import { Routes } from '@angular/router';

import { FluxoProcessoComponent } from './container/fluxo-processo.component';
import { FluxoProcessoAtualizarComponent } from './components/fluxo-processo-atualizar/fluxo-processo-atualizar.component';

export const fluxoProcessoRoute: Routes = [
  {
    path: '',
    component: FluxoProcessoComponent,
    data: { pageTitle: 'Fluxo de Processo' },
  },
  {
    path: 'criar',
    component: FluxoProcessoAtualizarComponent,
    data: { pageTitle: 'Criar Fluxo de Processo' },
  },
  {
    path: 'editar/:id',
    component: FluxoProcessoAtualizarComponent,
    data: { pageTitle: 'Editar Fluxo de Processo' },
  },
];
