import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { assinaturaRoute } from './assinatura.route';
import { AssinaturaComponent } from './containers/assinatura.component';
import { AssinaturaConfirmarAcaoComponent } from './components/assinatura-confirmar-acao.component';

@NgModule({
  declarations: [AssinaturaComponent, AssinaturaConfirmarAcaoComponent],
  imports: [SharedModule, RouterModule.forChild(assinaturaRoute)],
})
export class AssinaturaModule {}
