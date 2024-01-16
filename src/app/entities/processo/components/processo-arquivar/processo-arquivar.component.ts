import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ProcessoService } from '../../services/processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { EventBus } from 'src/app/shared/services/event-bus.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import {
  IProcesso,
  IProcessoRequest,
} from 'src/app/shared/models/processo.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

@Component({
  selector: 'app-arquivar-processo',
  templateUrl: './processo-arquivar.component.html',
})
export class ProcessoArquivarComponent implements OnInit, OnDestroy {
  processo?: IProcesso;
  tabela: string = 'mudancaListaProcessoNovo';
  motivo: string = '';

  arquivando: boolean = false;

  inscricaoArquivar!: Subscription;

  constructor(
    private exibirMensagemService: ExibirMensagemService,
    private processoService: ProcessoService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
  }

  ngOnDestroy(): void {
    if (this.inscricaoArquivar) this.inscricaoArquivar.unsubscribe();
  }

  private buscarDados(): void {
    this.processo = this.config.data.processo;
    this.tabela = this.config.data.tabela;
  }

  protected cancelar(): void {
    this.ref.close();
  }

  protected arquivar(): void {
    this.arquivando = true;

    const request: IProcessoRequest = {
      motivo: this.motivo,
    };

    this.inscricaoArquivar = this.processoService
      .arquivarProcesso(this.processo!.id!, request)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem('info', 'Serviço de Mensagem', [
            'Processo arquivado com sucesso',
          ]);
          this.arquivando = false;
          this.atualizarTabela();
          this.cancelar();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Arquivar', `Processo`);
          this.arquivando = false;
        },
      });
  }

  private atualizarTabela(): void {
    const tabelaEventMap = {
      '#criados': 'mudancaListaProcessoNovo',
      '#recebidos': 'mudancaListaProcessoRecebido',
    };

    const tabela =
      (tabelaEventMap as Record<string, string>)[this.tabela] ||
      'mudancaListaProcessoNovo';
    EventBus.getInstance().dispatch<any>(tabela);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
