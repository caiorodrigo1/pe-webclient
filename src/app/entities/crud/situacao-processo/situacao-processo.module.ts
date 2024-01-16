import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { SituacaoProcessoAtualizarComponent } from './components/situacao-processo-atualizar/situacao-processo-atualizar.component';
import { SituacaoProcessoComponent } from './container/situacao-processo.component';
import { situacaoProcessoRoute } from './situacao-processo.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(situacaoProcessoRoute)],
  declarations: [SituacaoProcessoComponent, SituacaoProcessoAtualizarComponent],
})
export class SituacaoProcessoModule {}
