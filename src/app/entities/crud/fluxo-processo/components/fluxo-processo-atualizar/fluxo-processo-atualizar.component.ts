import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { FluxoProcessoService } from '../../fluxo-processo.service';
import { AssuntoProcessoService } from '../../../assunto-processo/assunto-processo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { AddEtapaComponent } from '../add-etapa/add-etapa.component';
import {
  AssuntoProcesso,
  IAssuntoProcesso,
} from 'src/app/shared/models/assunto-processo.model';
import {
  FluxoProcesso,
  IEtapaFluxo,
  IFluxoProcesso,
} from 'src/app/shared/models/fluxo-processo.model';

@Component({
  selector: 'top-fluxo-processo-atualizar',
  templateUrl: './fluxo-processo-atualizar.component.html',
})
export class FluxoProcessoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Fluxo de Processo';
  acao: string = 'Criar';
  fluxoProcesso?: IFluxoProcesso;

  assuntosProcesso: IAssuntoProcesso[] = [];
  etapasFluxo: IEtapaFluxo[] = [];

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;
  inscricaoAssuntos!: Subscription;
  inscricaoExclusao!: Subscription;

  carregando: boolean = true;
  apagando: boolean = false;
  salvando: boolean = false;

  ref: DynamicDialogRef | undefined;

  editForm = this.fb.group({
    id: [this.fluxoProcesso?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    assunto: [new AssuntoProcesso(), Validators.required],
  });

  constructor(
    private fluxoProcessoService: FluxoProcessoService,
    private assuntoProcessoService: AssuntoProcessoService,
    private confirmationService: ConfirmationService,
    private exibirMensagemService: ExibirMensagemService,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
    if (this.inscricaoAssuntos) this.inscricaoAssuntos.unsubscribe();
    if (this.inscricaoExclusao) this.inscricaoExclusao.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarFluxoProcesso$(Number(id));
      } else {
        this.editForm.get('assunto')!.setValue(null);
        this.carregarAssuntosProcesso$(false);
        this.carregando = false;
      }
    });
  }

  private consultarFluxoProcesso$(id: number): void {
    this.inscricaoConsulta = this.fluxoProcessoService
      .consultarFluxoProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.fluxoProcesso = corpo.data;
          this.carregarAssuntosProcesso$(true);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  private carregarAssuntosProcesso$(id: boolean): void {
    this.assuntoProcessoService.consultarAssuntosProcesso().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body || { data: [] };
        this.assuntosProcesso = corpo.data;
        if (id) this.atualizarFormulario();
      },
      error: (resposta: HttpErrorResponse) => {
        this.assuntosProcesso = [];
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message || '', 'Buscar', 'Assuntos de Processo');
      },
    });
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.fluxoProcesso?.id,
      nome: this.fluxoProcesso?.nome,
      assunto: this.fluxoProcesso?.assunto,
    });
    if (this.fluxoProcesso?.etapaFluxo)
      this.etapasFluxo = this.fluxoProcesso?.etapaFluxo;
    this.carregando = false;
    this.editForm.markAllAsTouched();
  }

  protected addEtapa(): void {
    this.ref = this.dialogService.open(AddEtapaComponent, {
      position: 'top',
      header: 'Etapa do Fluxo',
      width: '500px',
      contentStyle: { overflow: 'visible' },
      maximizable: true,
      data: {
        fluxoId: this.editForm.get(['id'])!.value || undefined!,
      },
    });

    this.ref.onClose.subscribe((etapa: IEtapaFluxo) => {
      if (etapa) this.etapasFluxo.push(etapa);
      console.log(this.etapasFluxo);
    });
  }

  protected excluirEtapa(etapa: IEtapaFluxo): void {
    this.confirmationService.confirm({
      message: 'Deseja mesmo excluir esta Etapa?',
      header: 'Confirmar',
      icon: 'fa fa-question',
      accept: () => {
        this.apagando = true;

        if (etapa.id) {
          this.inscricaoExclusao = this.fluxoProcessoService
            .excluirEtapa(etapa.id)
            .subscribe({
              complete: () => this.excluirEtapaLista(etapa),
              error: (resposta: HttpErrorResponse) => {
                const erro: IEntidade = resposta.error;
                this.exibirErro(erro.message || '', 'Excluir', 'Etapa');
                this.apagando = false;
              },
            });
        } else {
          this.excluirEtapaLista(etapa);
        }
      },
    });
  }

  private excluirEtapaLista(etapa: IEtapaFluxo): void {
    this.etapasFluxo.splice(this.etapasFluxo.indexOf(etapa), 1);
    this.apagando = false;
  }

  protected cancelar(): void {
    this.router.navigate(['fluxo-processo']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const fluxoProcesso = this.criarFormulario();

      if (fluxoProcesso.id === undefined) {
        this.chamarServico(
          this.fluxoProcessoService.incluirFluxoProcesso(fluxoProcesso),
          'criado'
        );
      } else {
        this.chamarServico(
          this.fluxoProcessoService.atualizarFluxoProcesso(fluxoProcesso),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): IFluxoProcesso {
    return {
      ...new FluxoProcesso(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      assuntoId: this.editForm.get(['assunto'])!.value.id,
      etapaFluxo: this.etapasFluxo || [],
    };
  }

  private chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>,
    acao: string
  ): void {
    this.inscricaoServico = resultado.subscribe({
      complete: () => this.seguir_sucesso(acao),
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message || '', 'Salvar', this.recipiente);
      },
    });
  }

  private seguir_sucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${this.recipiente} ${acao} com sucesso.`,
    ]);
    this.salvando = false;
    this.cancelar();
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
