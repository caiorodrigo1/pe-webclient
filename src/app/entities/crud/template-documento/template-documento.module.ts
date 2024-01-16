import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { TemplateDocumentoComponent } from './containers/template-documento.component';
import { TemplateDocumentoAtualizarComponent } from './components/template-documento-atualizar/template-documento-atualizar.component';
import { templateDocumentoRoute } from './template-documento.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(templateDocumentoRoute)],
  declarations: [
    TemplateDocumentoComponent,
    TemplateDocumentoAtualizarComponent,
  ],
})
export class TemplateDocumentoModule {}
