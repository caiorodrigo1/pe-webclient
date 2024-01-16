import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { FluxoProcessoComponent } from './container/fluxo-processo.component';
import { FluxoProcessoAtualizarComponent } from './components/fluxo-processo-atualizar/fluxo-processo-atualizar.component';
import { fluxoProcessoRoute } from './fluxo-processo.route';
import { AddEtapaComponent } from './components/add-etapa/add-etapa.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  imports: [
    ConfirmDialogModule,
    SharedModule,
    RouterModule.forChild(fluxoProcessoRoute),
  ],
  declarations: [
    FluxoProcessoComponent,
    FluxoProcessoAtualizarComponent,
    AddEtapaComponent,
  ],
})
export class FluxoProcessoModule {}
