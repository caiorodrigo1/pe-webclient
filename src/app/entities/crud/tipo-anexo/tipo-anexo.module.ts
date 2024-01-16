import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { tipoAnexoRoute } from './tipo-anexo.route';
import { TipoAnexoComponent } from './containers/tipo-anexo.component';
import { TipoAnexoAtualizarComponent } from './components/tipo-anexo-atualizar/tipo-anexo-atualizar.component';

@NgModule({
  declarations: [TipoAnexoComponent, TipoAnexoAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(tipoAnexoRoute)],
})
export class TipoAnexoModule {}
