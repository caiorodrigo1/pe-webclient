import { Routes } from '@angular/router';

import { TipoDocumentoComponent } from './containers/tipo-documento.component';
import { TipoDocumentoAtualizarComponent } from './components/tipo-documento-atualizar/tipo-documento-atualizar.component';

export const tipoDocumentoRoute: Routes = [
  {
    path: '',
    component: TipoDocumentoComponent,
    data: { pageTitle: 'Tipos de Documento' },
  },
  {
    path: 'criar',
    component: TipoDocumentoAtualizarComponent,
    data: { pageTitle: 'Criar Tipo de Documento' },
  },
  {
    path: 'editar/:id',
    component: TipoDocumentoAtualizarComponent,
    data: { pageTitle: 'Editar Tipo de Documento' },
  },
];
