import { Routes } from '@angular/router';

import { TemplateDocumentoAtualizarComponent } from './components/template-documento-atualizar/template-documento-atualizar.component';
import { TemplateDocumentoComponent } from './containers/template-documento.component';

export const templateDocumentoRoute: Routes = [
  {
    path: '',
    component: TemplateDocumentoComponent,
    data: { pageTitle: 'Template de Documento' },
  },
  {
    path: 'criar',
    component: TemplateDocumentoAtualizarComponent,
    data: { pageTitle: 'Criar Template de Documento' },
  },
  {
    path: 'editar/:id',
    component: TemplateDocumentoAtualizarComponent,
    data: { pageTitle: 'Editar Template de Documento' },
  },
];
