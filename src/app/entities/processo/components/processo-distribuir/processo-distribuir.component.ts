import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ProcessoService } from '../../services/processo.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { EventBus } from 'src/app/shared/services/event-bus.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { IUsuario } from 'src/app/shared/models/usuario.model';
import { IProcesso } from 'src/app/shared/models/processo.model';

@Component({
  selector: 'top-modal-distribuir',
  templateUrl: './processo-distribuir.component.html',
})
export class ProcessoDistribuirComponent implements OnInit, OnDestroy {
  processo?: IProcesso;
  usuarioLogado!: IUsuarioLogado;
  tabela: string = 'mudancaListaProcessoNovo';

  listaUsuarios!: IUsuario[];
  usuarioSelecionado!: IUsuario;

  inscricaoUsuarioLogado!: Subscription;
  inscricaoUsuarios!: Subscription;
  inscricaoDistribuir!: Subscription;

  distribuindo: boolean = false;

  constructor(
    private orgaoService: OrgaoService,
    private processoService: ProcessoService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
    this.buscarUsuarioLogado$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoUsuarios) this.inscricaoUsuarios.unsubscribe();
    if (this.inscricaoDistribuir) this.inscricaoDistribuir.unsubscribe();
  }

  private buscarDados(): void {
    this.processo = this.config.data.processo;
    this.tabela = this.config.data.tabela;
  }

  private buscarUsuarioLogado$(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.usuarioLogado = resposta;
        this.carregarUsuarios$(this.usuarioLogado.setor!.id!);
      });
  }

  private carregarUsuarios$(id: number): void {
    this.inscricaoUsuarios = this.orgaoService
      .consultarUsuariosPorSetorId(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.listaUsuarios = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro = resposta.error;
          this.exibirErro(erro.message, 'Carregar', 'Usuários');
          this.distribuindo = false;
        },
      });
  }

  protected distribuir(): void {
    if (this.usuarioSelecionado) {
      this.distribuindo = true;
      this.enviarUsuario();
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'Selecione O Usuário de Destino',
      ]);
    }
  }

  private enviarUsuario(): void {
    const distribuicao = {
      processoId: this.processo!.id,
      usuarioOrigemId: this.usuarioLogado.id,
      setorOrigemId: this.usuarioLogado.setor!.id,
      usuarioDestinoId: this.usuarioSelecionado.id,
    };

    this.inscricaoDistribuir = this.processoService
      .distribuir(distribuicao)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Processo distribuído para o usuário']
          );
          this.atualizarTabela();
          this.fechar();
          this.distribuindo = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro = resposta.error;
          this.exibirErro(erro.message, 'Distribuir', 'Processo');
          this.distribuindo = false;
        },
      });
  }

  protected fechar(): void {
    this.ref.close();
  }

  private atualizarTabela(): void {
    const tabelaEventMap = {
      '#criados': 'mudancaListaProcessoNovo',
      '#recebidos': 'mudancaListaProcessoRecebido',
      '#enviados': 'mudancaListaProcessoEnviado',
      '#favoritos': 'mudancaListaProcessoFavorito',
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
