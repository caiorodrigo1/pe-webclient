import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { cnpj } from 'cpf-cnpj-validator';

import { ClienteService } from '../../cliente.service';
//import { MunicipioService } from 'src/app/shared/services/municipio.service';
import { ViacepService } from 'src/app/shared/services/viacep.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
//import { IMunicipio, Municipio } from 'src/app/shared/models/municipio.model';
import { Cliente, ICliente } from 'src/app/shared/models/cliente.model';
import { IEndereco } from 'src/app/shared/models/endereco.model';

@Component({
  selector: 'top-cliente-atualizar',
  templateUrl: './cliente-atualizar.component.html',
})
export class ClienteAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Cliente';
  acao: string = 'Criar';
  cliente?: ICliente;
  //municipios: IMunicipio[] = [];

  base64Image: string | undefined;
  uploadedFileName: string = '';

  inscricaoCliente!: Subscription;
  //inscricaoMunicipios!: Subscription;
  inscricaoEndereco!: Subscription;
  inscricaoUsuarioLogado!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.cliente?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
    logo: [''],
    cnpj: [
      '',
      [Validators.required, Validators.minLength(14), Validators.maxLength(14)],
    ],
    ativo: [true, Validators.required],
    cep: [''],
    endereco: {},
    //uf: ['', [Validators.minLength(2), Validators.maxLength(2)]],
    uf: [''],
    cidade: [''],
    //municipio: [new Municipio(), Validators.required],
    ibge: ['', [Validators.minLength(7), Validators.maxLength(7)]],
    logradouro: [''],
    bairro: [''],
    numero: [''],
    complemento: [''],
    telefone: {},
    principal: [''],
    adicional: [''],
  });

  constructor(
    private clienteService: ClienteService,
    //private municipioService: MunicipioService,
    private viacepService: ViacepService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    //this.carregarMunicipio$();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoCliente) this.inscricaoCliente.unsubscribe();
    //if (this.inscricaoMunicipios) this.inscricaoMunicipios.unsubscribe();
    if (this.inscricaoEndereco) this.inscricaoEndereco.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarCliente$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarCliente$(id: number): void {
    this.inscricaoCliente = this.clienteService.consultarCliente(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.cliente = corpo!.data;
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
      id: this.cliente?.id,
      nome: this.cliente?.nome,
      logo: this.cliente?.logo,
      cnpj: this.cliente?.cnpj,
      //municipio: this.cliente?.municipio,
      cep: this.cliente?.cep,
      ativo: this.cliente ? this.cliente?.ativo : true,
      uf: this.cliente?.endereco?.uf,
      cidade: this.cliente?.endereco?.cidade,
      ibge: this.cliente?.endereco?.ibge,
      logradouro: this.cliente?.endereco?.logradouro,
      bairro: this.cliente?.endereco?.bairro,
      numero: this.cliente?.endereco?.numero,
      complemento: this.cliente?.endereco?.complemento,
      principal: this.cliente?.telefone?.principal,
      adicional: this.cliente?.telefone?.adicional,
    });
    this.editForm.markAllAsTouched();
  }

  // protected carregarMunicipio$(): void {
  //   this.inscricaoMunicipios = this.municipioService
  //     .consultarMunicipios()
  //     .subscribe({
  //       next: (resposta: HttpResponse<IEntidade[]>) => {
  //         const res: any = resposta.body;
  //         this.municipios = res.data || [];
  //         console.log(this.municipios);
  //         this.atualizarFormulario();
  //       },
  //     });
  // }

  private criarFormulario(): ICliente {
    return {
      ...new Cliente(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      logo: this.editForm.get(['logo'])!.value,
      cnpj: this.editForm.get(['cnpj'])!.value,
      cep: this.editForm.get(['cep'])!.value,
      //municipioId: this.editForm.get(['municipio'])!.value.id,
      ativo: this.editForm.get(['ativo'])!.value,
      endereco: {
        uf: this.editForm.get(['uf'])!.value || 0,
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

  protected cancelar(): void {
    this.router.navigate(['cliente']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const cliente = this.criarFormulario();

      if (cliente.id === undefined) {
        this.chamarServico(
          this.clienteService.incluirCliente(cliente),
          'criado'
        );
      } else {
        this.chamarServico(
          this.clienteService.atualizarCliente(cliente),
          'atualizado'
        );
      }
    }
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
    this.router.navigate(['cliente']);
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

  // protected testarCep(cep: string) {
  //   const unmaskedCEP = cep.replace(/\D/g, '');
  //   if (unmaskedCEP.length === 8) {
  //     this.buscarEndereco(unmaskedCEP);
  //   }
  // }

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
      uf: endereco!.uf,
      bairro: endereco!.bairro,
      ibge: endereco!.ibge,
      logradouro: endereco!.logradouro,
      complemento: endereco!.complemento,
    });
  }

  protected testarValidadeCnpj(palavra: string) {
    if (!cnpj.isValid(palavra) && palavra !== '') {
      this.editForm.get('cnpj')!.setErrors({ invalid: true });
    }
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;

      this.convertToBase64(file);
    }
  }

  private convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const base64ImageWithoutPrefix = base64Data.split(',')[1];
      this.base64Image = base64ImageWithoutPrefix;
      this.editForm.patchValue({ logo: this.base64Image });
    };
    reader.readAsDataURL(file);
  }
}
