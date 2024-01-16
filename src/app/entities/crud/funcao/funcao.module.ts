import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { FuncaoComponent } from './containers/funcao.component';
import { FuncaoAtualizarComponent } from './components/funcao-atualizar/funcao-atualizar.component';
import { funcaoRoute } from './funcao.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(funcaoRoute)],
  declarations: [FuncaoComponent, FuncaoAtualizarComponent],
})
export class FuncaoModule {}
