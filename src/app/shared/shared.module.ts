import { NgModule } from '@angular/core';

import { SharedLibsModule } from './shared-libs.module';
import { MessageService } from 'primeng/api';

import { TopCabecalhoComponent } from './components/top-cabecalho/top-cabecalho.component';
import { SignatarioModalComponent } from './components/signatario-modal/signatario-modal.component';
import { VisualizarDocumentoComponent } from './components/visualizar-documento/visualizar-documento.component';
import { TopBtoComponent } from './components/top-bto/top-bto.component';

import { GetDataPipe } from './pipes/get-data.pipe';
import { BindFieldPipe } from './pipes/bind-field.pipe';
import { MascaraCpfCnpjPipe } from './pipes/mascara-cpf-cnpj.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { NumeroProcessoPipe } from './pipes/numero-processo.pipe';
import { MesPipe } from './pipes/mes.pipe';

@NgModule({
  imports: [SharedLibsModule],
  declarations: [
    TopCabecalhoComponent,
    SignatarioModalComponent,
    VisualizarDocumentoComponent,
    TopBtoComponent,
    GetDataPipe,
    BindFieldPipe,
    MascaraCpfCnpjPipe,
    FileSizePipe,
    NumeroProcessoPipe,
    MesPipe,
  ],
  exports: [
    SharedLibsModule,
    TopCabecalhoComponent,
    SignatarioModalComponent,
    VisualizarDocumentoComponent,
    TopBtoComponent,
    GetDataPipe,
    BindFieldPipe,
    MascaraCpfCnpjPipe,
    FileSizePipe,
    NumeroProcessoPipe,
    MesPipe,
  ],
  providers: [MessageService],
})
export class SharedModule {}
