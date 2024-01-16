import { Routes } from '@angular/router';

import { InteressadoProcessoComponent } from './container/interessado-processo.component';
import { InteressadoProcessoAtualizarComponent } from './components/interessado-processo-atualizar/interessado-processo-atualizar.component';

export const interessadoProcessoRoute: Routes = [
  {
    path: '',
    component: InteressadoProcessoComponent,
    data: { pageTitle: 'Interessados no Processo' },
  },
  {
    path: 'criar',
    component: InteressadoProcessoAtualizarComponent,
    data: { pageTitle: 'Criar Interessado no Processo' },
  },
  {
    path: 'editar/:id',
    component: InteressadoProcessoAtualizarComponent,
    data: { pageTitle: 'Editar Interessado no Processo' },
  },
];
