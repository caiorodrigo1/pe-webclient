import { Routes } from '@angular/router';

import { TipoProcessoComponent } from './containers/tipo-processo.component';
import { TipoProcessoAtualizarComponent } from './components/tipo-processo-atualizar/tipo-processo-atualizar.component';

export const tipoProcessoRoute: Routes = [
  {
    path: '',
    component: TipoProcessoComponent,
    data: { pageTitle: 'Tipos de Processo' },
  },
  {
    path: 'criar',
    component: TipoProcessoAtualizarComponent,
    data: { pageTitle: 'Criar Tipo de Processo' },
  },
  {
    path: 'editar/:id',
    component: TipoProcessoAtualizarComponent,
    data: { pageTitle: 'Editar Tipo de Processo' },
  },
];
