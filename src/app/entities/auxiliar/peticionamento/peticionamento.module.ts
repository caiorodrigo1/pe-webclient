import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

import { PeticionamentoComponent } from './containers/peticionamento.component';
import { peticionamentoRoute } from './peticionamento.route';
import { PeticionamentoConcluirComponent } from './components/peticionamento-concluir.component';

@NgModule({
  declarations: [PeticionamentoComponent, PeticionamentoConcluirComponent],
  imports: [SharedModule, RouterModule.forChild(peticionamentoRoute)],
})
export class PeticionamentoModule {}
