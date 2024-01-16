import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { OrgaoComponent } from './container/orgao.component';
import { orgaoRoute } from './orgao.route';
import { OrgaoAtualizarComponent } from './components/orgao-atualizar/orgao-atualizar.component';

@NgModule({
  declarations: [OrgaoComponent, OrgaoAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(orgaoRoute)],
})
export class OrgaoModule {}
