import { Routes } from '@angular/router';

import { TemplateProcessoComponent } from './containers/template-processo.component';
import { TemplateProcessoAtualizarComponent } from './components/template-processo-atualizar/template-processo-atualizar.component';

export const templateProcessoRoute: Routes = [
  {
    path: '',
    component: TemplateProcessoComponent,
    data: { pageTitle: 'Template de Processo' },
  },
  {
    path: 'criar',
    component: TemplateProcessoAtualizarComponent,
    data: { pageTitle: 'Criar Template de Processo' },
  },
  {
    path: 'editar/:id',
    component: TemplateProcessoAtualizarComponent,
    data: { pageTitle: 'Editar Template de Processo' },
  },
];
