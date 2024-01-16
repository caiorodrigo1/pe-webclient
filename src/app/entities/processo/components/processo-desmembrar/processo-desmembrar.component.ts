import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { ProcessoService } from '../../services/processo.service';
import { IDocumento } from 'src/app/shared/models/documento.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

@Component({
  selector: 'top-desmembrar-modal',
  templateUrl: './processo-desmembrar.component.html',
})
export class processoDesmembrarComponent implements OnInit, OnDestroy {
  processoId!: number;
  documentos: IDocumento[] = [];

  desmembrando: boolean = false;

  inscricaoDesmembrando!: Subscription;

  constructor(
    private processoService: ProcessoService,
    private exibirMensagemService: ExibirMensagemService,
    private confirmationService: ConfirmationService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
  }

  ngOnDestroy(): void {
    if (this.inscricaoDesmembrando) this.inscricaoDesmembrando.unsubscribe();
  }

  private buscarDados(): void {
    this.processoId = this.config.data.processoId;
    this.documentos = this.config.data.documentos;
  }

  protected cancelar(): void {
    this.ref.close();
  }

  protected confirmar(id: number): void {
    if (this.documentos.length <= 1) {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'Processo com um único documento não pode ser desmembrado',
      ]);

      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja desmembrar o processo através desse documento?`,
      header: 'Realizar Desmembramento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.desmembrarProcesso(id),
    });
  }

  private desmembrarProcesso(documentoId: number): void {
    this.desmembrando = true;

    this.inscricaoDesmembrando = this.processoService
      .desmembrarDocumento(this.processoId, documentoId)
      .subscribe({
        next: (resposta) => {
          console.log('resposta: ', resposta);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Desmembrar', `Processo`);
          this.desmembrando = false;
        },
        complete: () => {
          this.aoSalvarComSucesso('Processo', 'Desmembrado');
          this.cancelar();
        },
      });
  }

  private aoSalvarComSucesso(recipiente: string, acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${recipiente} ${acao} Com Sucesso.`,
    ]);
    this.desmembrando = false;
  }

  private exibirErro(codigo: string, acao: string, item: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${item}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
