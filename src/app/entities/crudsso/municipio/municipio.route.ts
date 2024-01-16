import { Routes } from '@angular/router';

import { MunicipioComponent } from './container/municipio.component';
import { MunicipioAtualizarComponent } from './components/municipio-atualizar/municipio-atualizar.component';

export const municipioRoute: Routes = [
  {
    path: '',
    component: MunicipioComponent,
    data: { pageTitle: 'Município' },
  },
  {
    path: 'criar',
    component: MunicipioAtualizarComponent,
    data: { pageTitle: 'Criar Município' },
  },
  {
    path: 'editar/:id',
    component: MunicipioAtualizarComponent,
    data: { pageTitle: 'Editar Município' },
  },
];
