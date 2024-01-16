import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { SetorComponent } from './container/setor.component';
import { SetorAtualizarComponent } from './components/setor-atualizar/setor-atualizar.component';
import { setorRoute } from './setor.route';

@NgModule({
  declarations: [SetorComponent, SetorAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(setorRoute)],
})
export class SetorModule {}
