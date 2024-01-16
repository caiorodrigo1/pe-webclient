import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { TipoDocumentoComponent } from './containers/tipo-documento.component';
import { TipoDocumentoAtualizarComponent } from './components/tipo-documento-atualizar/tipo-documento-atualizar.component';
import { tipoDocumentoRoute } from './tipo-documento.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(tipoDocumentoRoute)],
  declarations: [TipoDocumentoComponent, TipoDocumentoAtualizarComponent],
})
export class TipoDocumentoModule {}
