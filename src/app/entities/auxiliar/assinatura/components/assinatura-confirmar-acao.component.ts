import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { AssinaturaService } from '../assinatura.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

interface AssinaturaRequest {
  pecaId: number;
  statusSignatario: string;
  senha: string;
  observacao?: string;
}

@Component({
  selector: 'app-distribuir',
  templateUrl: './assinatura-confirmar-acao.component.html',
})
export class AssinaturaConfirmarAcaoComponent implements OnInit {
  id!: number;
  modelo!: string;

  acao!: String;
  motivo: string = '';
  senha!: string;

  inscricaoAssinatura!: Subscription;

  aguardando: boolean = false;

  constructor(
    private assinaturaService: AssinaturaService,
    private exibirMensagemService: ExibirMensagemService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
  }

  ngOnDestroy(): void {
    if (this.inscricaoAssinatura) this.inscricaoAssinatura.unsubscribe();
  }

  private buscarDados(): void {
    this.id = this.config.data.id;
    this.modelo = this.config.data.modelo;
    this.acao = this.config.data.acao;
  }

  protected confirmarAcao(): void {
    this.aguardando = true;
    if (this.acao === 'ASSINAR') {
      if (this.senha) {
        this.assinarDocumento();
      } else {
        this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
          'Informe a Senha',
        ]);
        this.aguardando = false;
      }
    } else if (this.acao === 'REJEITAR') {
      if (this.motivo && this.senha) {
        this.rejeitarDoumento();
      } else {
        this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
          'Informe a Senha e o Motivo da Rejeição',
        ]);
        this.aguardando = false;
      }
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'Erro no Modelo de Confirmação/Rejeição',
      ]);
      this.aguardando = false;
    }
  }

  private assinarDocumento(): void {
    const request: AssinaturaRequest = {
      pecaId: this.id,
      statusSignatario: 'ASSINADO',
      senha: this.senha,
    };
    if (this.modelo === 'Documento' || this.modelo === 'documento') {
      this.chamarServico(this.assinaturaService.assinarDocumento(request));
    } else if (this.modelo === 'Anexo' || this.modelo === 'anexo') {
      this.chamarServico(this.assinaturaService.assinarAnexo(request));
    }
  }

  private rejeitarDoumento(): void {
    const request: AssinaturaRequest = {
      pecaId: this.id,
      statusSignatario: 'REJEITADO',
      senha: this.senha,
      observacao: this.motivo,
    };
    if (this.modelo === 'Documento' || this.modelo === 'documento') {
      this.chamarServico(this.assinaturaService.rejeitarDocumento(request));
    } else if (this.modelo === 'Anexo' || this.modelo === 'anexo') {
      this.chamarServico(this.assinaturaService.rejeitarAnexo(request));
    }
  }

  protected chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>
  ): void {
    this.inscricaoAssinatura = resultado.subscribe({
      complete: () => {
        let acao;
        if (this.acao === 'ASSINAR') {
          acao = 'Realizada';
        } else {
          acao = 'Rejeitada';
        }
        this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
          `Assinatura ${acao} Com Sucesso`,
        ]);
        this.aguardando = false;
        this.ref.close(true);
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Confirmar Ação no', `Documento`);
        this.aguardando = false;
      },
    });
  }

  private exibirErro(codigo: string, acao: string, item: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${item}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
