import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { instituicaoExternaRoute } from './instituicao-externa.route';
import { InstituicaoExternaComponent } from './containers/instituicao-externa.component';
import { InstituicaoExternaAtualizarComponent } from './components/instituicao-externa-atualizar/instituicao-externa-atualizar.component';

@NgModule({
  declarations: [
    InstituicaoExternaComponent,
    InstituicaoExternaAtualizarComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(instituicaoExternaRoute)],
})
export class InstituicaoExternaModule {}
