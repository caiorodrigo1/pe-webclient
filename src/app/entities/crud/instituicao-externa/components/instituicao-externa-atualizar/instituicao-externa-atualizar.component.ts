import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { InstituicaoExternaService } from '../../instituicao-externa.service';
import { ViacepService } from 'src/app/shared/services/viacep.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { Uf, UfOption } from 'src/app/shared/enums/uf.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IEndereco } from 'src/app/shared/models/endereco.model';
import {
  IInstituicaoExterna,
  InstituicaoExterna,
} from 'src/app/shared/models/instituicao-externa.model';

@Component({
  selector: 'top-instituicao-externa-atualizar',
  templateUrl: './instituicao-externa-atualizar.component.html',
})
export class InstituicaoExternaAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Instituição Externa';
  acao: string = 'Criar';
  instituicaoExterna?: IInstituicaoExterna;
  ufs: UfOption[] = [];

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;
  inscricaoEndereco!: Subscription;

  isModal: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.instituicaoExterna?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    sigla: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(15)],
    ],
    unidadeOrganizacional: ['', Validators.maxLength(50)],
    siglaUnidadeOrganizacional: ['', Validators.maxLength(15)],
    responsavel: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    cargoDoResponsavel: ['', Validators.maxLength(50)],
    tratamento: ['', Validators.maxLength(50)],
    endereco: ['', Validators.maxLength(400)],
    cep: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
    ],
    cidade: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    estado: [
      { valor: '' },
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
  });

  constructor(
    private instituicaoExternaService: InstituicaoExternaService,
    private viacepService: ViacepService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    @Optional() private ref: DynamicDialogRef,
    @Optional() private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    if (this.config) this.isModal = true;
    this.preencherUFs();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
    if (this.inscricaoEndereco) this.inscricaoEndereco.unsubscribe();
  }

  private preencherUFs(): void {
    this.ufs = Object.keys(Uf).map((key) => ({
      nome: Uf[key as keyof typeof Uf],
      valor: key as keyof typeof Uf,
    }));
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarInstituicaoExterna$(Number(id));
      } else {
        this.carregando = false;
        this.editForm.get(['estado'])?.setValue(undefined);
      }
    });
  }

  private consultarInstituicaoExterna$(id: number): void {
    this.inscricaoConsulta = this.instituicaoExternaService
      .consultarInstituicaoExterna(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.instituicaoExterna = corpo.data;
          this.atualizarFormulario();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', this.recipiente);
        },
      });
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.instituicaoExterna?.id,
      nome: this.instituicaoExterna?.nome,
      sigla: this.instituicaoExterna?.sigla,
      unidadeOrganizacional: this.instituicaoExterna?.unidadeOrganizacional,
      siglaUnidadeOrganizacional:
        this.instituicaoExterna?.siglaUnidadeOrganizacional,
      responsavel: this.instituicaoExterna?.responsavel,
      cargoDoResponsavel: this.instituicaoExterna?.cargoDoResponsavel,
      tratamento: this.instituicaoExterna?.tratamento,
      cep: this.instituicaoExterna?.cep,
      endereco: this.instituicaoExterna?.endereco,
      cidade: this.instituicaoExterna?.cidade,
      estado: this.instituicaoExterna?.estado
        ? { valor: this.instituicaoExterna?.estado }
        : null,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    if (this.isModal) {
      this.ref.close();
    } else {
      this.router.navigate(['instituicao-externa']);
    }
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const interessadoProcesso = this.criarFormulario();

      if (interessadoProcesso.id === undefined) {
        this.chamarServico(
          this.instituicaoExternaService.incluirInstituicaoExterna(
            interessadoProcesso
          ),
          'criada'
        );
      } else {
        this.chamarServico(
          this.instituicaoExternaService.atualizarInstituicaoExterna(
            interessadoProcesso
          ),
          'atualizada'
        );
      }
    }
  }

  private criarFormulario(): IInstituicaoExterna {
    return {
      ...new InstituicaoExterna(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      sigla: this.editForm.get(['sigla'])!.value,
      unidadeOrganizacional: this.editForm.get(['unidadeOrganizacional'])!
        .value,
      siglaUnidadeOrganizacional: this.editForm.get([
        'siglaUnidadeOrganizacional',
      ])!.value,
      responsavel: this.editForm.get(['responsavel'])!.value,
      cargoDoResponsavel: this.editForm.get(['cargoDoResponsavel'])!.value,
      tratamento: this.editForm.get(['tratamento'])!.value,
      cep: this.editForm.get(['cep'])!.value,
      endereco: this.editForm.get(['endereco'])!.value,
      cidade: this.editForm.get(['cidade'])!.value,
      estado: this.editForm.get(['estado'])!.value.valor,
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

  private buscarEndereco(cep: string) {
    this.inscricaoEndereco = this.viacepService.consultarCep(cep).subscribe({
      next: (resposta: HttpResponse<IEndereco>) => {
        const endereco = resposta.body;
        this.escreverEndereco(endereco);
      },
      error: () => this.exibirErro('', 'Buscar', 'CEP'),
    });
  }

  private escreverEndereco(endereco: IEndereco | null) {
    if (endereco!.erro) {
      this.editForm.get('cep')!.setErrors({ invalido: true });
      return;
    }

    let enderecoCompleto = '';
    if (endereco!.bairro) enderecoCompleto += `Bairro ${endereco!.bairro}`;
    if (endereco!.logradouro) enderecoCompleto += `, ${endereco!.logradouro}`;
    if (endereco!.complemento) enderecoCompleto += `, ${endereco!.complemento}`;

    this.editForm.patchValue({
      cidade: endereco!.localidade,
      estado: endereco!.uf ? { valor: endereco!.uf } : null,
      endereco: enderecoCompleto,
    });
  }

  protected testarCep() {
    const cep = this.editForm.get('cep')?.value;
    if (cep && cep.length === 8) this.buscarEndereco(cep);
  }

  // protected onKeyUp(target: any) {
  //   if (target.value.length === 8) this.buscarEndereco(target.value);
  // }
}
