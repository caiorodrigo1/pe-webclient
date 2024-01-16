import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { TemplateDespachoComponent } from './containers/template-despacho.component';
import { TemplateDespachoAtualizarComponent } from './components/template-despacho-atualizar/template-despacho-atualizar.component';
import { templateDespachoRoute } from './template-despacho.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(templateDespachoRoute)],
  declarations: [TemplateDespachoComponent, TemplateDespachoAtualizarComponent],
})
export class TemplateDespachoModule {}
