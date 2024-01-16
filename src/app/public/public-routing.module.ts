import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginGuard } from '../auth/guards/login.guard';
import { LoginComponent } from './components/login/login.component';
import { PeticionamentoCadastrarComponent } from './components/peticionamento-cadastrar/peticionamento-cadastrar.component';
import { PeticionamentoConsultarComponent } from './components/peticionamento-consultar/peticionamento-consultar.component';
import { ValidacaoDocumentoComponent } from './components/validacao-documento/validacao-documento.component';
import { ConsultaPublicaComponent } from './components/consulta-publica/consulta-publica.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'validacao-documento',
    component: ValidacaoDocumentoComponent,
  },
  {
    path: 'consulta-publica',
    component: ConsultaPublicaComponent,
  },
  {
    path: 'peticionamento-cadastrar',
    component: PeticionamentoCadastrarComponent,
  },
  {
    path: 'peticionamento-consultar',
    component: PeticionamentoConsultarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
