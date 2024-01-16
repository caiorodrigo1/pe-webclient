import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { UsuarioComponent } from './container/usuario.component';
import { usuarioRoute } from './usuario.route';
import { UsuarioAtualizarComponent } from './components/usuario-atualizar/usuario-atualizar.component';

@NgModule({
  imports: [SharedModule, RouterModule.forChild(usuarioRoute)],
  declarations: [UsuarioComponent, UsuarioAtualizarComponent],
})
export class UsuarioModule {}
