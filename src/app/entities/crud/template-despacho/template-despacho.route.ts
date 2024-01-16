import { Routes } from '@angular/router';

import { TemplateDespachoComponent } from './containers/template-despacho.component';
import { TemplateDespachoAtualizarComponent } from './components/template-despacho-atualizar/template-despacho-atualizar.component';

export const templateDespachoRoute: Routes = [
  {
    path: '',
    component: TemplateDespachoComponent,
    data: { pageTitle: 'Template de Despacho' },
  },
  {
    path: 'criar',
    component: TemplateDespachoAtualizarComponent,
    data: { pageTitle: 'Criar Template de Despacho' },
  },
  {
    path: 'editar/:id',
    component: TemplateDespachoAtualizarComponent,
    data: { pageTitle: 'Editar Template de Despacho' },
  },
];
