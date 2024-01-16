import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { TemplateProcessoComponent } from './containers/template-processo.component';
import { TemplateProcessoAtualizarComponent } from './components/template-processo-atualizar/template-processo-atualizar.component';
import { templateProcessoRoute } from './template-processo.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(templateProcessoRoute)],
  declarations: [TemplateProcessoComponent, TemplateProcessoAtualizarComponent],
})
export class TemplateProcessoModule {}
