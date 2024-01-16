import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { InteressadoProcessoService } from 'src/app/entities/crud/interessado-processo/interessado-processo.service';
import { ProcessoService } from '../../../services/processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { InteressadoProcessoAtualizarComponent } from 'src/app/entities/crud/interessado-processo/components/interessado-processo-atualizar/interessado-processo-atualizar.component';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IInteressadoProcesso } from 'src/app/shared/models/interessado-processo.model';
import { IProcesso } from 'src/app/shared/models/processo.model';

@Component({
  selector: 'top-processo-interessado',
  templateUrl: './processo-interessado.component.html',
})
export class ProcessoInteressadoComponent implements OnInit, OnDestroy {
  @Input() processo!: IProcesso;
  @Input() interessadosAdicionados: IInteressadoProcesso[] = [];
  @Input() interessadosSalvos: IInteressadoProcesso[] = [];

  ref: DynamicDialogRef | undefined;

  interessados: IInteressadoProcesso[] = [];

  inscricaoInteressadosProcesso!: Subscription;
  inscricaoExcluir!: Subscription;

  excluindo: boolean = false;

  constructor(
    private interessadoProcessoService: InteressadoProcessoService,
    private processoService: ProcessoService,
    private exibirMensagemService: ExibirMensagemService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.carregarInteressadosProcesso$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoExcluir) this.inscricaoExcluir.unsubscribe();
    if (this.inscricaoInteressadosProcesso)
      this.inscricaoInteressadosProcesso.unsubscribe();
  }

  private carregarInteressadosProcesso$(): void {
    this.inscricaoInteressadosProcesso = this.interessadoProcessoService
      .consultarInteressadosProcesso()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.interessados = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.interessados = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Interessados no Processo');
        },
      });
  }

  verificarAdicao(interessadoId: number): boolean {
    const adicionado = this.interessadosAdicionados.some(
      (item) => item.id === interessadoId
    );

    const salvo = this.interessadosSalvos.some(
      (item) => item.id === interessadoId
    );

    return adicionado || salvo;
  }

  protected adicionarInteressado(interessado: IInteressadoProcesso): void {
    this.interessadosAdicionados.push(interessado);
  }

  protected excluirInteressado(interessado: IInteressadoProcesso): void {
    const indice = this.interessadosAdicionados.findIndex(
      (item) => item.id == interessado.id
    );
    if (indice > -1) {
      this.interessadosAdicionados.splice(indice, 1);
    }
  }

  protected excluirInteressadoSalvo(interessadoId: number): void {
    this.excluindo = true;
    this.inscricaoExcluir = this.processoService
      .excluirInteressado_Processo(interessadoId, this.processo.id!)
      .subscribe({
        complete: () => {
          const indice = this.interessadosSalvos.findIndex(
            (item) => item.id == interessadoId
          );
          if (indice > -1) {
            this.interessadosSalvos.splice(indice, 1);
          }
          this.excluindo = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Excluir', 'Anexo');
          this.excluindo = false;
        },
      });
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  protected criarInteressado_Processo(): void {
    this.ref = this.dialogService.open(InteressadoProcessoAtualizarComponent, {
      position: 'top',
      header: 'Criar Interessado no Processo',
      width: '100%',
      style: { maxWidth: '800px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      this.carregarInteressadosProcesso$();
    });
  }
}
