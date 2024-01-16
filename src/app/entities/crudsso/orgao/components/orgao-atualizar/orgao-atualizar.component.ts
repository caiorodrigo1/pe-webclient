import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { OrgaoService } from '../../orgao.service';
import { ViacepService } from 'src/app/shared/services/viacep.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { Uf, UfOption } from 'src/app/shared/enums/uf.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IEndereco } from 'src/app/shared/models/endereco.model';
import { IOrgao, Orgao } from 'src/app/shared/models/orgao.model';

@Component({
  selector: 'top-orgao-atualizar',
  templateUrl: './orgao-atualizar.component.html',
})
export class OrgaoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Órgão';
  acao: string = 'Criar';
  orgao?: IOrgao;
  ufs: UfOption[] = [];

  clienteId: number | undefined;

  incricaoOrgao!: Subscription;
  inscricaoEndereco!: Subscription;
  inscricaoUsuarioLogado!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    clienteId: [0],
    id: [this.orgao?.id],
    sigla: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(15)],
    ],
    descricao: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
    ativo: [true, Validators.required],
    descricaoCompleta: ['mock'],
    cep: [''],
    endereco: {},
    uf: [{ valor: '' }],
    cidade: [''],
    ibge: [''],
    logradouro: [''],
    bairro: [''],
    numero: [''],
    complemento: [''],
    telefone: {},
    principal: [''],
    adicional: [''],
  });

  constructor(
    private orgaoService: OrgaoService,
    private viacepService: ViacepService,
    private usuarioLogadoService: UsuarioLogadoService,
    private exibirMensagemService: ExibirMensagemService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.preencherUFs();
    this.buscarOrigem();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.incricaoOrgao) this.incricaoOrgao.unsubscribe();
    if (this.inscricaoEndereco) this.inscricaoEndereco.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private preencherUFs(): void {
    this.ufs = this.ufs = Object.keys(Uf).map((key) => ({
      nome: Uf[key as keyof typeof Uf],
      valor: key,
    }));
  }

  private buscarOrigem(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.clienteId = resposta.clienteId;
      });
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarOrgao$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarOrgao$(id: number): void {
    this.incricaoOrgao = this.orgaoService.consultarOrgao(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body!;
        this.orgao = corpo.data || [];
        this.atualizarFormulario();
        this.carregando = false;
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', this.recipiente);
      },
    });
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.orgao?.id || undefined,
      sigla: this.orgao?.sigla,
      descricao: this.orgao?.descricao,
      ativo: this.orgao ? this.orgao?.ativo : true,
      cep: this.orgao?.descricaoCompleta,
      uf: this.orgao?.endereco?.uf ? { valor: this.orgao?.endereco?.uf } : null,
      cidade: this.orgao?.endereco?.cidade,
      ibge: this.orgao?.endereco?.ibge,
      logradouro: this.orgao?.endereco?.logradouro,
      bairro: this.orgao?.endereco?.bairro,
      numero: this.orgao?.endereco?.numero,
      complemento: this.orgao?.endereco?.complemento,
      principal: this.orgao?.telefone?.principal,
      adicional: this.orgao?.telefone?.adicional,
    });
    console.log(this.orgao);
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['orgao']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const orgao = this.criarFormulario();

      if (orgao.id === undefined) {
        this.chamarServico(this.orgaoService.incluirOrgao(orgao), 'criado');
      } else {
        this.chamarServico(
          this.orgaoService.atualizarOrgao(orgao),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): IOrgao {
    return {
      ...new Orgao(),
      clienteId: Number(this.clienteId),
      id: this.editForm.get(['id'])!.value || undefined,
      sigla: this.editForm.get(['sigla'])!.value,
      descricao: this.editForm.get(['descricao'])!.value,
      descricaoCompleta: this.editForm.get(['descricaoCompleta'])!.value,
      ativo: this.editForm.get(['ativo'])!.value,
      //cep: this.editForm.get(['cep'])!.value,
      endereco: {
        uf: this.editForm.get(['uf'])!.value.valor || 0,
        cidade: this.editForm.get(['cidade'])!.value,
        ibge: this.editForm.get(['ibge'])!.value,
        logradouro: this.editForm.get(['logradouro'])!.value,
        bairro: this.editForm.get(['bairro'])!.value,
        numero: this.editForm.get(['numero'])!.value,
        complemento: this.editForm.get(['complemento'])!.value,
      },
      telefone: {
        principal: this.editForm.get(['principal'])!.value,
        adicional: this.editForm.get(['adicional'])!.value,
      },
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
    this.router.navigate(['orgao']);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }

  protected testarCep() {
    const cep = this.editForm.get('cep')?.value;
    if (cep && cep.length === 8) this.buscarEndereco(cep);
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

    this.editForm.patchValue({
      cidade: endereco!.localidade,
      uf: endereco!.uf ? { valor: endereco!.uf } : null,
      bairro: endereco!.bairro,
      ibge: endereco!.ibge,
      logradouro: endereco!.logradouro,
      complemento: endereco!.complemento,
    });
  }
}
