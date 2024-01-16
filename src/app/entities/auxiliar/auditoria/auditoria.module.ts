import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { auditoriaRoute } from './auditoria.route';
import { AuditoriaComponent } from '../auditoria/container/auditoria.component';
import { AuditoriaVisualizarComponent } from './components/auditoria-visualizar.component';

@NgModule({
  declarations: [AuditoriaComponent, AuditoriaVisualizarComponent],
  imports: [SharedModule, RouterModule.forChild(auditoriaRoute)],
})
export class AuditoriaModule {}
