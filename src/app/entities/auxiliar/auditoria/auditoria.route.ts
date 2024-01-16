import { Routes } from '@angular/router';

import { AuditoriaComponent } from '../auditoria/container/auditoria.component';
import { AuditoriaVisualizarComponent } from './components/auditoria-visualizar.component';

export const auditoriaRoute: Routes = [
  {
    path: '',
    component: AuditoriaComponent,
    data: { pageTitle: 'Auditoria' },
  },
  {
    path: 'visualizar',
    component: AuditoriaVisualizarComponent,
    data: { pageTitle: 'Visualizar' },
  },
];
