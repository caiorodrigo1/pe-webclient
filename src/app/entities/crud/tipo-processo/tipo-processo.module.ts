import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { TipoProcessoComponent } from './containers/tipo-processo.component';
import { TipoProcessoAtualizarComponent } from './components/tipo-processo-atualizar/tipo-processo-atualizar.component';
import { tipoProcessoRoute } from './tipo-processo.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(tipoProcessoRoute)],
  declarations: [TipoProcessoComponent, TipoProcessoAtualizarComponent],
})
export class TipoProcessoModule {}
