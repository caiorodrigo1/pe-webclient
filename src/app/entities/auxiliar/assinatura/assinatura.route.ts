import { Routes } from '@angular/router';
import { AssinaturaComponent } from './containers/assinatura.component';

export const assinaturaRoute: Routes = [
  {
    path: '',
    component: AssinaturaComponent,
    data: { pageTitle: 'Assinaturas' },
  },
];
