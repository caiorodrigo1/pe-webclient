import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { SetorService } from '../../setor.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import { ISetor, Setor } from 'src/app/shared/models/setor.model';

@Component({
  selector: 'top-setor-atualizar',
  templateUrl: './setor-atualizar.component.html',
})
export class SetorAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Setor';
  acao: string = 'Criar';
  setor?: ISetor;
  orgaos: IOrgao[] = [];

  tenant: string | undefined;

  incricaoSetor!: Subscription;
  incricaoOrgao!: Subscription;
  inscricaoUsuarioLogado!: Subscription;
  inscricaoServico!: Subscription;

  edicao: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.setor?.id],
    orgao: ['', [Validators.required]],
    sigla: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(15)],
    ],
    descricao: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    ativo: [true, Validators.required],
  });

  constructor(
    private setorService: SetorService,
    private orgaoService: OrgaoService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buscarOrigem();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.incricaoSetor) this.incricaoSetor.unsubscribe();
    if (this.incricaoOrgao) this.incricaoOrgao.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private buscarOrigem(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.tenant = resposta.identificadorCliente;
      });
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.edicao = true;
        this.editForm.get('orgao')?.clearValidators();
        this.consultarSetor$(Number(id));
      } else {
        this.carregarOrgao$();
        this.carregando = false;
      }
    });
  }

  private consultarSetor$(id: number): void {
    this.incricaoSetor = this.setorService.consultarSetor(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body!;
        this.setor = corpo.data || [];
        this.atualizarFormulario();
        this.carregando = false;
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', this.recipiente);
      },
    });
  }

  protected carregarOrgao$(): void {
    this.incricaoOrgao = this.orgaoService
      .consultarOrgaosExterno(this.tenant!)
      .subscribe({
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

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.setor?.id,
      sigla: this.setor?.sigla,
      descricao: this.setor?.descricao,
      ativo: this.setor ? this.setor?.ativo : true,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['setor']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const setor = this.criarFormulario();

      if (setor.id === undefined) {
        this.chamarServico(this.setorService.incluirSetor(setor), 'criado');
      } else {
        this.chamarServico(
          this.setorService.atualizarSetor(setor),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ISetor {
    return {
      ...new Setor(),
      id: this.editForm.get(['id'])!.value || undefined,
      orgaoId: this.editForm.get(['orgao'])!.value?.id || this.setor!.orgaoId,
      sigla: this.editForm.get(['sigla'])!.value,
      descricao: this.editForm.get(['descricao'])!.value,
      ativo: this.editForm.get(['ativo'])!.value,
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
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  private seguir_sucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${this.recipiente} ${acao} com sucesso.`,
    ]);
    this.salvando = false;
    this.router.navigate(['setor']);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
