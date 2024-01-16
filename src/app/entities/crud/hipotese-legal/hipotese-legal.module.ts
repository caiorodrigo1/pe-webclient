import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { hipoteseLegalRoute } from './hipotese-legal.route';
import { HipoteseLegalComponent } from './containers/hipotese-legal.component';
import { HipoteseLegalAtualizarComponent } from './components/hipotese-legal-atualizar/hipotese-legal-atualizar.component';

@NgModule({
  declarations: [HipoteseLegalComponent, HipoteseLegalAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(hipoteseLegalRoute)],
})
export class HipoteseLegalModule {}
