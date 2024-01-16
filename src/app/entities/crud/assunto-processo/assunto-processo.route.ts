import { Routes } from '@angular/router';

import { AssuntoProcessoComponent } from './containers/assunto-processo.component';
import { AssuntoProcessoAtualizarComponent } from './components/assunto-processo-atualizar/assunto-processo-atualizar.component';

export const assuntoProcessoRoute: Routes = [
  {
    path: '',
    component: AssuntoProcessoComponent,
    data: { pageTitle: 'Assuntos do Processo' },
  },
  {
    path: 'criar',
    component: AssuntoProcessoAtualizarComponent,
    data: { pageTitle: 'Criar Assunto do Processo' },
  },
  {
    path: 'editar/:id',
    component: AssuntoProcessoAtualizarComponent,
    data: { pageTitle: 'Editar Assunto do Processo' },
  },
];
