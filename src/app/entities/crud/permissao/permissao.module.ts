import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { permissaoRoute } from './permissao.route';
import { PermissaoAtualizarComponent } from './components/permissao-atualizar/permissao-atualizar.component';
import { PermissaoComponent } from './container/permissao.component';

@NgModule({
  declarations: [PermissaoComponent, PermissaoAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(permissaoRoute)],
})
export class PermissaoModule {}
