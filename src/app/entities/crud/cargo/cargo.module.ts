import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { CargoComponent } from './containers/cargo.component';
import { CargoAtualizarComponent } from './components/cargo-atualizar/cargo-atualizar.component';
import { cargoRoute } from './cargo.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(cargoRoute)],
  declarations: [CargoComponent, CargoAtualizarComponent],
})
export class CargoModule {}
