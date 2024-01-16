import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { clienteRoute } from './cliente.route';
import { ClienteComponent } from './container/cliente.component';
import { ClienteAtualizarComponent } from './components/cliente-atualizar/cliente-atualizar.component';

@NgModule({
  declarations: [ClienteComponent, ClienteAtualizarComponent],
  imports: [SharedModule, RouterModule.forChild(clienteRoute)],
})
export class ClienteModule {}
