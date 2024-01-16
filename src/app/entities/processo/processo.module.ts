import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'src/app/shared/shared.module';
import { processoRoute } from './processo.route';

import { ProcessoComponent } from './containers/geral/processo.component';
import { PesquisaProcessoComponent } from './containers/pesquisa/pesquisaProcesso.component';
import { ProcessoCriarComponent } from './components/processo-criar/processo-criar.component';
import { ProcessoGeralComponent } from './components/processo-criar/processo-geral/processo-geral.component';
import { ProcessoDocumentoComponent } from './components/processo-criar/processo-documento/processo-documento.component';
import { ProcessoAnexoComponent } from './components/processo-criar/processo-anexo/processo-anexo.component';
import { ProcessoInteressadoComponent } from './components/processo-criar/processo-interessado/processo-interessado.component';
import { ProcessoTramitacaoComponent } from './components/processo-tramitar/processo-tramitacao.component';
import { ProcessoDistribuirComponent } from './components/processo-distribuir/processo-distribuir.component';
import { ProcessoArquivarComponent } from './components/processo-arquivar/processo-arquivar.component';
import { ProcessoDespachoComponent } from './components/processo-despacho/processo-despacho.component';
import { ProcessoVisualizarComponent } from './components/processo-visualizar/processo-visualizar.component';
// import { UsuarioSignatarioComponent } from './components/processo-atualizar/processo-final/components/usuario-signatario.component';
import { processoDesmembrarComponent } from './components/processo-desmembrar/processo-desmembrar.component';
import { ProcessoListaModalComponent } from './components/processo-lista-modal/processo-lista-modal.component';

@NgModule({
  declarations: [
    ProcessoComponent,
    PesquisaProcessoComponent,
    ProcessoCriarComponent,
    ProcessoGeralComponent,
    ProcessoDocumentoComponent,
    ProcessoAnexoComponent,
    ProcessoInteressadoComponent,
    ProcessoTramitacaoComponent,
    ProcessoDistribuirComponent,
    ProcessoArquivarComponent,
    ProcessoDespachoComponent,
    ProcessoVisualizarComponent,
    // UsuarioSignatarioComponent,
    processoDesmembrarComponent,
    ProcessoListaModalComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(processoRoute)],
  providers: [],
})
export class ProcessoModule {}
