import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { UnidadeComponent } from './container/unidade.component';
import { unidadeRoute } from './unidade.route';
import { UnidadeAtualizarComponent } from './components/unidade-atualizar/unidade-atualizar.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(unidadeRoute)],
  declarations: [UnidadeComponent, UnidadeAtualizarComponent],
})
export class UnidadeModule {}
