import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { PapeisUsuarioAtualizarComponent } from './components/papeis-usuario-atualizar/papeis-usuario-atualizar.component';
import { PapeisUsuarioComponent } from './container/papeis-usuario.component';
import { papeisUsuarioRoute } from './papeis-usuario.route';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(papeisUsuarioRoute)],
  declarations: [PapeisUsuarioComponent, PapeisUsuarioAtualizarComponent],
})
export class PapeisUsuarioModule {}
