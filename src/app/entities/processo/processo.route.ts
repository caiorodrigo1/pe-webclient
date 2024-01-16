import { Routes } from '@angular/router';

import { ComponentGuard } from 'src/app/auth/guards/component.guard';
import { ProcessoComponent } from './containers/geral/processo.component';
import { ProcessoCriarComponent } from './components/processo-criar/processo-criar.component';
import { ProcessoVisualizarComponent } from './components/processo-visualizar/processo-visualizar.component';
import { ProcessoDespachoComponent } from './components/processo-despacho/processo-despacho.component';
import { PesquisaProcessoComponent } from './containers/pesquisa/pesquisaProcesso.component';

export const processoRoute: Routes = [
  {
    path: '',
    redirectTo: 'entrada',
    pathMatch: 'full',
  },
  {
    path: 'pesquisa',
    component: PesquisaProcessoComponent,
    data: { pageTitle: 'Pesquisa' },
  },
  {
    path: ':tipo',
    component: ProcessoComponent,
    data: { pageTitle: 'Processo' },
  },
  {
    path: ':tipo/criar',
    component: ProcessoCriarComponent,
    data: { pageTitle: 'Criar Processo' },
    canActivate: [ComponentGuard],
  },
  {
    path: ':tipo/visualizar/:id',
    component: ProcessoVisualizarComponent,
    data: { pageTitle: 'Visualizar Processo' },
    canActivate: [ComponentGuard],
  },
  {
    path: ':tipo/adicionar-despacho',
    component: ProcessoDespachoComponent,
    data: { pageTitle: 'Adicionar Despacho' },
    canActivate: [ComponentGuard],
  },
];
