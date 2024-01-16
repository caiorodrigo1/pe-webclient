import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { MunicipioComponent } from './container/municipio.component';
import { MunicipioAtualizarComponent } from './components/municipio-atualizar/municipio-atualizar.component';
import { municipioRoute } from './municipio.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(municipioRoute)],
  declarations: [MunicipioComponent, MunicipioAtualizarComponent],
})
export class MunicipioModule {}
