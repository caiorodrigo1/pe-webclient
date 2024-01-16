import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { CargoService } from '../../cargo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ICargo, Cargo } from 'src/app/shared/models/cargo.model';

@Component({
  selector: 'top-cargo-atualizar',
  templateUrl: './cargo-atualizar.component.html',
})
export class CargoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Cargo';
  acao: string = 'Criar';
  cargo?: ICargo;

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.cargo?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    ],
    descricao: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(300)],
    ],
  });

  constructor(
    private cargoService: CargoService,
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
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarCargo$(Number(id));
      } else {
        this.carregando = false;
      }
    });
  }

  private consultarCargo$(id: number): void {
    this.inscricaoConsulta = this.cargoService.consultarCargo(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body || { data: {} };
        this.cargo = corpo.data;
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
      id: this.cargo?.id,
      nome: this.cargo?.nome,
      descricao: this.cargo?.descricao,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['cargo']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const cargo = this.criarFormulario();

      if (cargo.id === undefined) {
        this.chamarServico(this.cargoService.incluirCargo(cargo), 'criado');
      } else {
        this.chamarServico(
          this.cargoService.atualizarCargo(cargo),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): ICargo {
    return {
      ...new Cargo(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      descricao: this.editForm.get(['descricao'])!.value,
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
