import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { SituacaoProcessoService } from '../../situacao-processo.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ISetor, Setor } from 'src/app/shared/models/setor.model';
import {
  ISituacaoProcesso,
  SituacaoProcesso,
} from 'src/app/shared/models/situacao-processo.model';

@Component({
  selector: 'top-situacao-processo-atualizar',
  templateUrl: './situacao-processo-atualizar.component.html',
})
export class SituacaoProcessoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Situação do Processo';
  acao: string = 'Criar';
  situacaoProcesso?: ISituacaoProcesso;
  setores: ISetor[] = [];

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;
  inscricaoSetores!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.situacaoProcesso?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    setor: [new Setor(), Validators.required],
  });

  constructor(
    protected situacaoProcessoService: SituacaoProcessoService,
    protected orgaoService: OrgaoService,
    private exibirMensagemService: ExibirMensagemService,
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
    if (this.inscricaoSetores) this.inscricaoSetores.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarSituacaoProcesso$(Number(id));
      } else {
        this.limparDropdown();
        this.carregarSetores$(false);
        this.carregando = false;
      }
    });
  }

  private consultarSituacaoProcesso$(id: number): void {
    this.inscricaoConsulta = this.situacaoProcessoService
      .consultarSituacaoProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.situacaoProcesso = corpo.data;
          this.carregarSetores$(true);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  protected carregarSetores$(id: boolean): void {
    this.inscricaoSetores = this.orgaoService
      .consultarSetoresAtuais()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.setores = corpo.data;
          if (id) this.atualizarFormulario(true);
        },
        error: (resposta: HttpErrorResponse) => {
          this.setores = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', 'Setores');
        },
      });
  }

  private atualizarFormulario(completo: boolean): void {
    this.editForm.patchValue({
      id: this.situacaoProcesso?.id,
      nome: this.situacaoProcesso?.nome,
      setor: this.situacaoProcesso?.setor,
    });
    if (!completo) this.limparDropdown();
    this.carregando = false;
    this.editForm.markAllAsTouched();
  }

  private limparDropdown(): void {
    this.editForm.patchValue({
      setor: undefined,
    });
  }

  protected cancelar(): void {
    this.router.navigate(['situacao-processo']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const situacaoProcesso = this.criarFormulario();

      if (situacaoProcesso.id === undefined) {
        this.chamarServico(
          this.situacaoProcessoService.incluirSituacaoProcesso(
            situacaoProcesso
          ),
          'criado'
        );
      } else {
        this.chamarServico(
          this.situacaoProcessoService.atualizarSituacaoProcesso(
            situacaoProcesso
          ),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ISituacaoProcesso {
    return {
      ...new SituacaoProcesso(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      setorId: this.editForm.get(['setor'])!.value.id,
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
