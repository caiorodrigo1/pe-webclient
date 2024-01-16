import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { MunicipioService } from '../../municipio.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { Uf, UfOption } from 'src/app/shared/enums/uf.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IMunicipio, Municipio } from 'src/app/shared/models/municipio.model';

interface uf {
  nome: Uf[number];
  valor: string;
}

@Component({
  selector: 'top-municipio-atualizar',
  templateUrl: './municipio-atualizar.component.html',
})
export class MunicipioAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Município';
  acao: string = 'Criar';
  municipio?: IMunicipio;
  ufs: UfOption[] = [];

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.municipio?.id],
    nome: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(500)],
    ],
    uf: [{ valor: '' }, Validators.required],
    codigoIBGE: [
      '',
      [Validators.required, Validators.minLength(7), Validators.maxLength(7)],
    ],
  });

  constructor(
    private municipioService: MunicipioService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.ajustarDropdown();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
  }

  private ajustarDropdown(): void {
    this.ufs = Object.keys(Uf).map((key) => ({
      nome: Uf[key as keyof typeof Uf],
      valor: key,
    }));
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarMunicipio$(Number(id));
      } else {
        this.carregando = false;
        this.editForm.get(['uf'])?.setValue(undefined);
      }
    });
  }

  private consultarMunicipio$(id: number): void {
    this.inscricaoConsulta = this.municipioService
      .consultarMunicipio(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: {} };
          this.municipio = corpo.data;
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
      id: this.municipio?.id,
      nome: this.municipio?.nome,
      codigoIBGE: this.municipio?.codigoIBGE,
      uf: this.municipio?.uf ? { valor: this.municipio?.uf } : null,
    });
    this.editForm.markAllAsTouched();
  }

  protected cancelar(): void {
    this.router.navigate(['municipio']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const municipio = this.criarFormulario();

      if (municipio.id === undefined) {
        this.chamarServico(
          this.municipioService.incluirMunicipio(municipio),
          'criado'
        );
      } else {
        this.chamarServico(
          this.municipioService.atualizarMunicipio(municipio),
          'atualizado'
        );
      }
    }
  }

  private criarFormulario(): IMunicipio {
    return {
      ...new Municipio(),
      id: this.editForm.get(['id'])!.value || undefined,
      nome: this.editForm.get(['nome'])!.value,
      uf: this.editForm.get(['uf'])!.value.valor,
      codigoIBGE: this.editForm.get(['codigoIBGE'])!.value,
    };
  }

  protected chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>,
    acao: string
  ): void {
    this.inscricaoServico = resultado.subscribe({
      complete: () => this.salvarSucesso(acao),
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message || '', 'Salvar', this.recipiente);
      },
    });
  }

  protected salvarSucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${this.recipiente} ${acao} com sucesso.`,
    ]);
    this.router.navigate(['municipio']);
    this.salvando = false;
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
