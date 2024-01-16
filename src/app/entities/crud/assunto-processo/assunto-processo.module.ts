import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { assuntoProcessoRoute } from './assunto-processo.route';
import { AssuntoProcessoComponent } from './containers/assunto-processo.component';
import { AssuntoProcessoAtualizarComponent } from './components/assunto-processo-atualizar/assunto-processo-atualizar.component';

@NgModule({
  declarations: [AssuntoProcessoComponent, AssuntoProcessoAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(assuntoProcessoRoute)],
})
export class AssuntoProcessoModule {}
