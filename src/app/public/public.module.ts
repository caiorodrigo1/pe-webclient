import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './components/login/login.component';
import { PeticionamentoCadastrarComponent } from './components/peticionamento-cadastrar/peticionamento-cadastrar.component';
import { PeticionamentoConsultarComponent } from './components/peticionamento-consultar/peticionamento-consultar.component';
import { ConsultaPublicaComponent } from './components/consulta-publica/consulta-publica.component';
import { ValidacaoDocumentoComponent } from './components/validacao-documento/validacao-documento.component';

@NgModule({
  imports: [SharedModule, PublicRoutingModule],
  declarations: [
    LoginComponent,
    PeticionamentoCadastrarComponent,
    PeticionamentoConsultarComponent,
    ConsultaPublicaComponent,
    ValidacaoDocumentoComponent,
  ],

  exports: [],
})
export class PublicModule {}
