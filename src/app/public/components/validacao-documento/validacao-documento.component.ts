import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ValidacaoDocumentoService } from 'src/app/shared/services/validacao-documento.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDocumento } from 'src/app/shared/models/documento.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';

@Component({
  selector: 'top-validacao-documento',
  templateUrl: './validacao-documento.component.html',
})
export class ValidacaoDocumentoComponent implements OnInit, OnDestroy {
  //http://localhost:4200/validacao-documento?identificacao=D100027&autenticacao=42d42ff1

  documento!: IDocumento;

  inscricao!: Subscription;

  buscando: boolean = false;
  finalizado: boolean = false;
  documentoEncontrado: boolean = false;
  documentoNaoEncontrado: boolean = false;

  validacaoForm = this.formBuilder.group({
    codigo: ['', [Validators.required, Validators.minLength(7)]],
    crc: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(
    private validacaoDocumentoService: ValidacaoDocumentoService,
    private exibirMensagemService: ExibirMensagemService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buscarParametros();
  }

  ngOnDestroy(): void {}

  private buscarParametros(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['identificacao'] && params['autenticacao']) {
        const codigo = params['identificacao'];
        const crc = params['autenticacao'];
        this.validacaoForm.patchValue({ codigo: codigo, crc: crc });
        this.pesquisarDocumento();
      }
    });
  }

  protected pesquisarDocumento(): void {
    if (!this.validacaoForm.valid) {
      this.validacaoForm.markAllAsTouched();
      this.exibirMensagemService.mensagem(
        'error',
        'Serviço de Mensagem',
        ['Preencha Todos os Campos Obrigatórios do Formulário'],
        'app'
      );
      return;
    }

    this.buscando = true;

    const codigo = this.validacaoForm.get('codigo')!.value;
    const crc = this.validacaoForm.get('crc')!.value;

    this.inscricao = this.validacaoDocumentoService
      .buscarDocumentoValidado(codigo!, crc!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.documento = corpo!.data || {};
          this.documentoEncontrado = true;
          this.buscando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Documento');
          this.documentoNaoEncontrado = true;
          this.buscando = false;
        },
      });
  }

  protected exibir(): void {
    this.finalizado = true;
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
