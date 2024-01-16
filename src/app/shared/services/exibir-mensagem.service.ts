import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ExibirMensagemService {
  constructor(
    private messageService: MessageService // private confirmationService: ConfirmationService
  ) {}

  mensagem(
    tipo: string,
    titulo: string,
    mensagens?: string[],
    destino?: string
  ): void {
    mensagens?.map((mensagem) => {
      this.exibirMensagem(tipo, titulo, mensagem, destino);
    });
  }

  private exibirMensagem(
    tipo: string,
    titulo: string,
    mensagem: string,
    destino: string = 'main'
  ): void {
    const tipoMensagem = this.classificarMensagem(tipo);
    this.messageService.add({
      key: destino,
      severity: tipoMensagem,
      summary: titulo,
      detail: mensagem,
    });
  }

  private classificarMensagem(tipo: string): string {
    return tipo;
  }

  // confirmeMensagem(mensagem, accept, reject) {
  //   this.confirmationService.confirm({
  //     message: mensagem,
  //     header: 'Confirme',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => accept(),
  //     reject: () => reject(),
  //   });
  // }
}
