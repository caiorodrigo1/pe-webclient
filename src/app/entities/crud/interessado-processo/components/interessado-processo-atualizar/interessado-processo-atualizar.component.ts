import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { cpf, cnpj } from 'cpf-cnpj-validator';
//import { format, parse } from 'date-fns';

import { InteressadoProcessoService } from '../../interessado-processo.service';
//import { ViacepService } from 'src/app/shared/services/viacep.service';
//import { EventBus } from 'src/app/shared/services/event-bus.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
//import { IEndereco } from 'src/app/shared/models/endereco.model';
import {
  IInteressadoProcesso,
  InteressadoProcesso,
} from 'src/app/shared/models/interessado-processo.model';

interface estadoOpcao {
  label: string;
  valor: string;
}

@Component({
  selector: 'top-interessado-processo-atualizar',
  templateUrl: './interessado-processo-atualizar.component.html',
})
export class InteressadoProcessoAtualizarComponent
  implements OnInit, OnDestroy
{
  recipiente: string = 'Interessado no Processo';
  acao: string = 'Criar';

  interessadoProcesso?: IInteressadoProcesso;

  hoje: Date = new Date();
  pessoaOpcao: estadoOpcao[] = [
    { label: 'Pessoa Física', valor: 'fisica' },
    { label: 'Pessoa Jurídica', valor: 'juridica' },
  ];
  pessoa: estadoOpcao = {
    label: this.pessoaOpcao[0].label,
    valor: this.pessoaOpcao[0].valor,
  };

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;
  inscricaoEndereco!: Subscription;

  isModal: boolean = false;
  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.interessadoProcesso?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    cpf: [''],
    cnpj: [''],
    //cep: [''],
    telefone: ['', Validators.required],
    email: ['', [(Validators.minLength(2), Validators.maxLength(300))]],
    //endereco: ['', Validators.maxLength(300)],
    observacao: ['', Validators.maxLength(300)],
    //dataNascimento: [],
  });

  constructor(
    protected interessadoProcessoService: InteressadoProcessoService,
    //private viacepService: ViacepService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    @Optional() private ref: DynamicDialogRef,
    @Optional() private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    if (this.config) this.isModal = true;
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
    if (this.inscricaoEndereco) this.inscricaoEndereco.unsubscribe();
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarInteressadoProcesso$(Number(id));
      } else {
        this.editForm.get('cpf')!.setValidators([Validators.required]);
        this.carregando = false;
      }
    });
  }

  private consultarInteressadoProcesso$(id: number): void {
    this.inscricaoConsulta = this.interessadoProcessoService
      .consultarInteressadoProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.interessadoProcesso = corpo.data;
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
    this.analisarDocumento();
    this.editForm.patchValue({
      id: this.interessadoProcesso?.id,
      nome: this.interessadoProcesso?.nome,
      cpf:
        this.pessoa.valor === this.pessoaOpcao[0].valor
          ? this.interessadoProcesso?.documento
          : '',
      cnpj:
        this.pessoa.valor === this.pessoaOpcao[1].valor
          ? this.interessadoProcesso?.documento
          : '',
      telefone: this.interessadoProcesso?.telefone,
      email: this.interessadoProcesso?.email,
      //endereco: this.interessadoProcesso?.endereco,
      observacao: this.interessadoProcesso?.observacao,
      // dataNascimento:
      //   this.formatarData(this.interessadoProcesso?.dataNascimento, true) ||
      //   null,
    });
    this.editForm.markAllAsTouched();
  }

  private analisarDocumento(): void {
    if (
      this.interessadoProcesso?.documento &&
      this.interessadoProcesso?.documento.length === 14
    ) {
      this.pessoa = {
        label: this.pessoaOpcao[1].label,
        valor: this.pessoaOpcao[1].valor,
      };
      this.editForm.get('cnpj')!.setValidators([Validators.required]);
    } else {
      this.editForm.get('cpf')!.setValidators([Validators.required]);
    }
  }

  // private formatarData(data: Date | string, entrada: boolean): string {
  //   if (entrada) {
  //     const dataTime = new Date(data || '');
  //     if (!isNaN(dataTime.getTime())) {
  //       return format(dataTime, 'dd/MM/yyyy');
  //     }
  //   } else {
  //     if (typeof data === 'string') {
  //       const dataParsed = parse(data, 'dd/MM/yyyy', new Date());
  //       return format(dataParsed, 'yyyy-MM-dd');
  //     }
  //     return format(data, 'yyyy-MM-dd');
  //   }
  //   return '';
  // }

  protected cancelar(): void {
    if (this.isModal) {
      this.ref.close();
    } else {
      this.router.navigate(['interessado-processo']);
    }
  }

  protected testarValidadeCpf(target: string) {
    if (!cpf.isValid(target) && target !== '') {
      this.editForm.get('cpf')!.setErrors({ invalid: true });
    }
  }

  protected testarValidadeCnpj(target: string) {
    if (!cnpj.isValid(target) && target !== '') {
      this.editForm.get('cnpj')!.setErrors({ invalid: true });
    }
  }

  protected mudarValidator(): void {
    if (this.pessoa.valor === this.pessoaOpcao[0].valor) {
      this.editForm.get('cpf')!.setValidators([Validators.required]);
      this.editForm.get('cnpj')!.clearValidators();
    } else if (this.pessoa.valor === this.pessoaOpcao[1].valor) {
      this.editForm.get('cnpj')!.setValidators([Validators.required]);
      this.editForm.get('cpf')!.clearValidators();
    }
    this.editForm.get('cpf')!.updateValueAndValidity();
    this.editForm.get('cnpj')!.updateValueAndValidity();
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const interessadoProcesso = this.criarFormulario();

      // if (interessadoProcesso.dataNascimento !== null) {
      //   interessadoProcesso.dataNascimento = this.formatarData(
      //     interessadoProcesso.dataNascimento,
      //     false
      //   );
      // }

      if (interessadoProcesso.id === undefined) {
        this.chamarServico(
          this.interessadoProcessoService.incluirInteressadoProcesso(
            interessadoProcesso
          ),
          'criado'
        );
      } else {
        this.chamarServico(
          this.interessadoProcessoService.atualizarInteressadoProcesso(
            interessadoProcesso
          ),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): IInteressadoProcesso {
    return {
      ...new InteressadoProcesso(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      documento:
        this.pessoa.valor === 'juridica'
          ? this.editForm.get(['cnpj'])!.value
          : this.editForm.get(['cpf'])!.value,
      telefone: this.editForm.get(['telefone'])!.value,
      email: this.editForm.get(['email'])!.value || undefined,
      //endereco: this.editForm.get(['endereco'])!.value || undefined,
      observacao: this.editForm.get(['observacao'])!.value || undefined,
      //dataNascimento: this.editForm.get(['dataNascimento'])!.value,
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
    //EventBus.getInstance().dispatch<any>('mudancaListaInteressadoProcesso');
    this.salvando = false;
    this.cancelar();
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }

  // private buscarEndereco(cep: string) {
  //   this.inscricaoEndereco = this.viacepService.consultarCep(cep).subscribe({
  //     next: (resposta: HttpResponse<IEndereco>) => {
  //       const endereco = resposta.body;
  //       this.escreverEndereco(endereco);
  //     },
  //     error: () => this.exibirErro('', 'Buscar', 'CEP'),
  //   });
  // }

  // private escreverEndereco(endereco: IEndereco) {
  //   if (endereco.erro) {
  //     this.editForm.get('cep').setErrors({ invalido: true });
  //     return;
  //   }

  //   let enderecoCompleto = '';
  //   if (endereco.bairro) enderecoCompleto += `Bairro ${endereco.bairro}`;
  //   if (endereco.logradouro) enderecoCompleto += `, ${endereco.logradouro}`;
  //   if (endereco.complemento) enderecoCompleto += `, ${endereco.complemento}`;
  //   if (endereco.localidade) enderecoCompleto += `, ${endereco.localidade}.`;
  //   if (endereco.uf) enderecoCompleto += `, ${endereco.uf}`;

  //   this.editForm.patchValue({
  //     endereco: enderecoCompleto,
  //   });
  // }

  // protected testarCep(cep: string) {
  //   const unmaskedCEP = cep.replace(/\D/g, '');
  //   if (unmaskedCEP.length === 8) {
  //     this.buscarEndereco(unmaskedCEP);
  //   }
  // }
}
