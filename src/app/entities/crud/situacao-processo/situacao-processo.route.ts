import { Routes } from '@angular/router';

import { SituacaoProcessoAtualizarComponent } from './components/situacao-processo-atualizar/situacao-processo-atualizar.component';
import { SituacaoProcessoComponent } from './container/situacao-processo.component';

export const situacaoProcessoRoute: Routes = [
  {
    path: '',
    component: SituacaoProcessoComponent,
    data: { pageTitle: 'Situação do Processo' },
  },
  {
    path: 'criar',
    component: SituacaoProcessoAtualizarComponent,
    data: { pageTitle: 'Criar Situação do Processo' },
  },
  {
    path: 'editar/:id',
    component: SituacaoProcessoAtualizarComponent,
    data: { pageTitle: 'Editar Situação do Processo' },
  },
];
