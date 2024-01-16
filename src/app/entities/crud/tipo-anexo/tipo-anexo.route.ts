import { Routes } from '@angular/router';

import { TipoAnexoComponent } from './containers/tipo-anexo.component';
import { TipoAnexoAtualizarComponent } from './components/tipo-anexo-atualizar/tipo-anexo-atualizar.component';

export const tipoAnexoRoute: Routes = [
  {
    path: '',
    component: TipoAnexoComponent,
    data: { pageTitle: 'Tipos de Anexo' },
  },
  {
    path: 'criar',
    component: TipoAnexoAtualizarComponent,
    data: { pageTitle: 'Criar Tipo de Anexo' },
  },
  {
    path: 'editar/:id',
    component: TipoAnexoAtualizarComponent,
    data: { pageTitle: 'Editar Tipo de Anexo' },
  },
];
