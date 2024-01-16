import { Routes } from '@angular/router';
import { PeticionamentoComponent } from './containers/peticionamento.component';
import { ComponentGuard } from 'src/app/auth/guards/component.guard';
import { PeticionamentoConcluirComponent } from './components/peticionamento-concluir.component';

export const peticionamentoRoute: Routes = [
  {
    path: '',
    component: PeticionamentoComponent,
    data: { pageTitle: 'Peticionamento' },
  },
  {
    path: 'concluir',
    component: PeticionamentoConcluirComponent,
    data: { pageTitle: 'Concluir Peticionamento' },
    //canActivate: [ComponentGuard],
  },
];
