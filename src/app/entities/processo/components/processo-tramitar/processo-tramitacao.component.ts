import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';

import { ProcessoService } from '../../services/processo.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { InstituicaoExternaService } from 'src/app/entities/crud/instituicao-externa/instituicao-externa.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { EventBus } from 'src/app/shared/services/event-bus.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { InstituicaoExternaAtualizarComponent } from 'src/app/entities/crud/instituicao-externa/components/instituicao-externa-atualizar/instituicao-externa-atualizar.component';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IInstituicaoExterna } from 'src/app/shared/models/instituicao-externa.model';
import { IProcesso } from 'src/app/shared/models/processo.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { ISetor } from 'src/app/shared/models/setor.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import { IUsuario } from 'src/app/shared/models/usuario.model';
import { ITramitacaoProcesso } from 'src/app/shared/models/tramitacao-processo.model';

@Component({
  selector: 'app-tramitacao',
  templateUrl: './processo-tramitacao.component.html',
})
export class ProcessoTramitacaoComponent implements OnInit, OnDestroy {
  processo?: IProcesso;
  usuarioLogado!: IUsuarioLogado;
  tramitacao!: ITramitacaoProcesso;
  usuario!: IUsuario;
  orgao!: IOrgao;
  setor!: ISetor;
  instituicaoExterna!: IInstituicaoExterna;

  usuarios!: IUsuario[];
  orgaos!: IOrgao[];
  setores!: ISetor[];
  instituicoesExternas!: IInstituicaoExterna[];
  setoresAdicionados: ISetor[] = [];

  header_obj = 'Setor';
  tabela: string = 'mudancaListaProcessoNovo';
  opcao: number = -1;

  inscricaoUsuarioLogado!: Subscription;
  inscricaoOrgao!: Subscription;
  inscricaoOrgaos!: Subscription;
  inscricaoSetores!: Subscription;
  inscricaoUsuarios!: Subscription;
  inscricaoInstituicoes!: Subscription;
  inscricaoTramitacao!: Subscription;

  multSetor: boolean = false;
  semTramitacao: boolean = true;
  acessoSigiloso: boolean = false;
  orgaoIndefinido: boolean = true;
  setorIndefinido: boolean = true;
  tramitando: boolean = false;

  constructor(
    private processoService: ProcessoService,
    private instituicaoExternaService: InstituicaoExternaService,
    private orgaoService: OrgaoService,
    private usuarioLogadoService: UsuarioLogadoService,
    private dialogService: DialogService,
    private exibirMensagemService: ExibirMensagemService,
    private ref: DynamicDialogRef,
    private refExtra: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.buscarDados();
    this.buscarOrigens$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoOrgao) this.inscricaoOrgao.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoOrgaos) this.inscricaoOrgaos.unsubscribe();
    if (this.inscricaoSetores) this.inscricaoSetores.unsubscribe();
    if (this.inscricaoUsuarios) this.inscricaoUsuarios.unsubscribe();
    if (this.inscricaoInstituicoes) this.inscricaoInstituicoes.unsubscribe();
    if (this.inscricaoTramitacao) this.inscricaoTramitacao.unsubscribe();
  }

  private buscarDados(): void {
    this.processo = this.config.data.processo;
    this.tabela = this.config.data.tabela;
    if (this.processo!.nivelAcesso === 'SIGILOSO') {
      this.acessoSigiloso = true;
      this.header_obj = 'Usuário';
    }
    if (this.processo?.tramitaMultSetor) this.multSetor = true;
  }

  private buscarOrigens$() {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.usuarioLogado = resposta;

        this.tramitacao = {
          processoId: this.processo!.id,
          setorOrigemId: this.usuarioLogado.setor!.id,
          usuarioOrigemId: this.usuarioLogado!.id,
        };
      });
  }

  private carregarInstituicoes$() {
    this.inscricaoInstituicoes = this.instituicaoExternaService
      .consultarInstituicoesExternas()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.instituicoesExternas = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Instituições Externas');
        },
      });
  }

  private carregarOrgaos$() {
    this.inscricaoOrgaos = this.orgaoService.consultarOrgaos().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.orgaos = corpo!.data || [];
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', 'Órgãos');
      },
    });
  }

  private carregarSetores$(id: number) {
    this.inscricaoSetores = this.orgaoService
      .consultarSetoresPorOrgaoId(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.setores = corpo!.data || [];
          this.retirarSetorLogado();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Setores');
        },
      });
  }

  private carregarUsuarios$(id: number) {
    this.inscricaoUsuarios = this.orgaoService
      .consultarUsuariosPorSetorId(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.usuarios = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Usuários');
        },
      });
  }

  private retirarSetorLogado() {
    this.setores = this.setores.filter(
      (setor) => setor !== this.usuarioLogado.setor
    );
  }

  protected cancelar(): void {
    this.ref.close();
  }

  protected tramitar(): void {
    if (
      (this.opcao === 0 && this.setor && this.orgao) ||
      (this.opcao === 0 && this.multSetor && this.orgao)
    ) {
      if (this.acessoSigiloso) {
        if (this.usuario) {
          this.enviarParaUsuario();
        } else {
          this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
            'Existem campos não selecionados',
          ]);
        }
      } else if (this.multSetor) {
        if (this.setoresAdicionados.length > 0) {
          this.enviarParaSetores();
        } else {
          this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
            'Nenhum Setor Foi Adicionado',
          ]);
        }
      } else {
        this.enviarParaSetor();
      }
    } else if (this.opcao === 1 && this.instituicaoExterna) {
      this.enviarParaInstituicaoExterna();
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'Existem campos não selecionados',
      ]);
    }
  }

  private enviarParaSetor(): void {
    this.tramitando = true;
    this.tramitacao = {
      ...this.tramitacao,
      setorDestinoId: this.setor!.id,
    };

    this.inscricaoTramitacao = this.processoService
      .tramitar(this.tramitacao)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Enviado para outro setor']
          );
          this.tramitando = false;
          this.atualizarTabela();
          this.cancelar();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Tramitar', 'Processo');
          this.tramitando = false;
        },
      });
  }

  private enviarParaSetores(): void {
    this.tramitando = true;

    const setores = this.setoresAdicionados.map((setor) => ({
      setorDestinoId: setor.id,
    }));

    const tramitacaoSetores: ITramitacaoProcesso = {
      processoId: this.tramitacao.processoId,
      setores: setores,
    };

    this.inscricaoTramitacao = this.processoService
      .tramitarSetores(tramitacaoSetores)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Enviado Para Outros Setores']
          );
          this.tramitando = false;
          this.atualizarTabela();
          this.cancelar();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Tramitar', 'Processo');
          this.tramitando = false;
        },
      });
  }

  private enviarParaUsuario(): void {
    this.tramitando = true;
    this.tramitacao = {
      ...this.tramitacao,
      setorDestinoId: this.setor!.id,
      usuarioDestinoId: this.usuario.id,
    };
    this.inscricaoTramitacao = this.processoService
      .tramitar(this.tramitacao)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Enviado para outro usuário']
          );
          this.tramitando = false;
          this.atualizarTabela();
          this.cancelar();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Tramitar', 'Processo');
          this.tramitando = false;
        },
      });
  }

  private enviarParaInstituicaoExterna(): void {
    this.tramitando = true;
    this.tramitacao = {
      ...this.tramitacao,
      instituicaoExternaId: this.instituicaoExterna.id,
      usuarioDestinoId: this.tramitacao.usuarioOrigemId,
    };

    this.inscricaoTramitacao = this.processoService
      .enviarParaInstituicaoExterna(this.tramitacao)
      .subscribe({
        complete: () => {
          this.exibirMensagemService.mensagem(
            'success',
            'Serviço de Mensagem',
            ['Enviado para Instituição externa']
          );
          this.tramitando = false;
          this.atualizarTabela();
          this.cancelar();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Tramitar', 'Processo');
          this.tramitando = false;
        },
      });
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

  protected onTabOpen(event: any): void {
    this.opcao = event.index;
    this.semTramitacao = false;
    if (this.opcao === 0) {
      this.carregarOrgaos$();
      this.instituicoesExternas = [];
    } else if (event.index === 1) {
      this.carregarInstituicoes$();
      this.orgaos = [];
      this.orgaoIndefinido = true;
      this.setores = [];
      this.setoresAdicionados = [];
      this.setorIndefinido = true;
      this.usuarios = [];
    }
  }

  protected onTabClose(): void {
    this.semTramitacao = true;
  }

  protected onChangeOrgao(orgao: any): void {
    if (orgao) {
      this.orgaoIndefinido = false;
      this.carregarSetores$(orgao.id);
    }
  }

  protected onChangeSetor(setor: any): void {
    if (setor) {
      this.setorIndefinido = false;
      if (this.acessoSigiloso) {
        this.carregarUsuarios$(setor.id);
      }
    }
  }

  protected adicionarInstituicao() {
    this.refExtra = this.dialogService.open(
      InstituicaoExternaAtualizarComponent,
      {
        position: 'top',
        header: 'Criar Instituição Externa',
        width: '100%',
        style: { overflow: 'auto', maxHeight: '90vh', maxWidth: '800px' },
        contentStyle: { overflow: 'visible' },
        dismissableMask: true,
        draggable: true,
      }
    );

    this.refExtra.onClose.subscribe(() => {
      this.carregarInstituicoes$();
    });
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
