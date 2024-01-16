import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { interessadoProcessoRoute } from './interessado-processo.route';
import { InteressadoProcessoComponent } from './container/interessado-processo.component';
import { InteressadoProcessoAtualizarComponent } from './components/interessado-processo-atualizar/interessado-processo-atualizar.component';

@NgModule({
  declarations: [
    InteressadoProcessoComponent,
    InteressadoProcessoAtualizarComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(interessadoProcessoRoute)],
})
export class InteressadoProcessoModule {}
