import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { cpf } from 'cpf-cnpj-validator';

import { PeticionamentoService } from 'src/app/entities/auxiliar/peticionamento/peticionamento.service';
import { ClienteService } from 'src/app/shared/services/cliente.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { ViacepService } from 'src/app/shared/services/viacep.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { Uf, UfOption } from 'src/app/shared/enums/uf.enum';
import { ICliente } from 'src/app/shared/models/cliente.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IEndereco } from 'src/app/shared/models/endereco.model';
import {
  IPeticionamento,
  IPeticionamentoRequest,
} from 'src/app/shared/models/peticionamento.model';

@Component({
  selector: 'top-peticionamento-cadastrar',
  templateUrl: './peticionamento-cadastrar.component.html',
})
export class PeticionamentoCadastrarComponent implements OnInit, OnDestroy {
  editForm: FormGroup;

  tenant!: string;
  protocolo!: string;

  listaClientes: ICliente[] = [];
  listaOrgaos: IOrgao[] = [];
  ufs: UfOption[] = [];

  inscricaoClientes!: Subscription;
  inscricaoOrgaos!: Subscription;
  inscricaoEndereco!: Subscription;
  inscricaoServico!: Subscription;

  salvando: boolean = false;
  finalizado: boolean = false;

  constructor(
    private peticionamentoService: PeticionamentoService,
    private clienteService: ClienteService,
    private orgaoService: OrgaoService,
    private viacepService: ViacepService,
    private exibirMensagemService: ExibirMensagemService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      cliente: ['', [Validators.required]],
      orgao: [{ value: '', disabled: true }, [Validators.required]],
      nome: ['', [Validators.required]],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(300),
        ],
      ],
      cpf: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      endereco: ['', [Validators.required, Validators.maxLength(400)]],
      cep: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
      ],
      cidade: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      estado: [
        { valor: '' },
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      solicitacao: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.preencherUFs();
    this.carregarClientes$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoClientes) this.inscricaoClientes.unsubscribe();
    if (this.inscricaoOrgaos) this.inscricaoOrgaos.unsubscribe();
    if (this.inscricaoEndereco) this.inscricaoEndereco.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private preencherUFs(): void {
    this.ufs = Object.keys(Uf).map((key) => ({
      nome: Uf[key as keyof typeof Uf],
      valor: key as keyof typeof Uf,
    }));
  }

  private carregarClientes$(): void {
    this.inscricaoClientes = this.clienteService
      .consultarClientesTop()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.listaClientes = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.listaClientes = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Clientes');
        },
      });
  }

  protected onChangeCliente(cliente: ICliente): void {
    if (cliente) {
      this.tenant = cliente.tenant!;
      this.carregarOrgaos$();
    }
  }

  private carregarOrgaos$(): void {
    if (this.tenant) {
      this.inscricaoOrgaos = this.orgaoService
        .consultarOrgaosExterno(this.tenant)
        .subscribe({
          next: (resposta: HttpResponse<IEntidade>) => {
            const corpo = resposta.body;
            this.listaOrgaos = corpo!.data || [];
            this.editForm.get('orgao')?.enable();
          },
          error: (resposta: HttpErrorResponse) => {
            this.listaOrgaos = [];
            const erro: IEntidade = resposta.error;
            this.exibirErro(erro.message!, 'Buscar', 'Órgãos');
          },
        });
    }
  }

  protected testarValidadeCpf(target: string) {
    if (!cpf.isValid(target) && target !== '') {
      this.editForm.get('cpf')!.setErrors({ invalid: true });
    }
  }

  protected salvar(): void {
    if (!this.editForm.valid) {
      this.editForm.markAllAsTouched();
      this.exibirMensagemService.mensagem(
        'error',
        'Serviço de Mensagem',
        ['Preencha Todos os Campos Obrigatórios do Formulário'],
        'app'
      );
      return;
    }

    const request = this.criarFormulario();

    this.chamarServico(
      this.peticionamentoService.cadastrarPeticionamento(request)
    );
  }

  private criarFormulario(): IPeticionamentoRequest {
    return {
      tenant: this.tenant,
      orgaoDestinoId: this.editForm.get(['orgao'])!.value.id,
      solicitante: this.editForm.get(['nome'])!.value,
      email: this.editForm.get(['email'])!.value,
      tipoDocumentacao: 'CPF',
      documento: this.editForm.get(['cpf'])!.value,
      solicitacao: this.editForm.get(['solicitacao'])!.value,
      //telefone: this.editForm.get(['telefone'])!.value,
      //cep: this.editForm.get(['cep'])!.value,
      //cidade: this.editForm.get(['cidade'])!.value,
      //estado: this.editForm.get(['estado'])!.value.valor,
      //endereco: this.editForm.get(['endereco'])!.value,
      dataNascimento: '2023-06-09',
    };
  }

  private chamarServico(resultado: Observable<HttpResponse<IEntidade>>): void {
    this.salvando = true;
    this.inscricaoServico = resultado.subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        const peticionamento: IPeticionamento = corpo!.data;
        this.protocolo = peticionamento.protocolo || '';
        this.exibirMensagemService.mensagem(
          'success',
          'Serviço de Mensagem',
          [`Peticionamento Cadastrado com Sucesso.`],
          'app'
        );
        this.salvando = false;
        this.finalizado = true;
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Cadastrar', 'Peticionamento');
        this.salvando = false;
      },
    });
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

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem(
      'error',
      'Serviço de Mensagem',
      [erro],
      'app'
    );
  }
}
