import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { PeticionamentoService } from '../peticionamento.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { DataService } from 'src/app/shared/services/data.service';
import { config } from 'src/app/core/config/config';
import { EDITORCONFIG } from 'src/app/shared/constants/config.constants';
import {
  IPeticionamento,
  Peticionamento,
} from 'src/app/shared/models/peticionamento.model';

@Component({
  selector: 'top-peticionamento-concluir',
  templateUrl: './peticionamento-concluir.component.html',
})
export class PeticionamentoConcluirComponent implements OnInit, OnDestroy {
  acao: string = 'Concluir';
  recipiente: string = '';

  @ViewChild('labelAnexo') labelAnexo!: ElementRef<HTMLInputElement>;

  peticionamentosAbertos: IPeticionamento[] = [];
  peticionamentoSolicitacao: string = '';
  peticionamentoDataCadastro: string = '';
  peticionamentoDocumento: string = '';
  peticionamentoTipoDocumento: string = '';
  peticionamentoProtocolo: string = '';
  peticionamentoEmail: string = '';
  peticionamentoSolicitante: string = '';
  anexo: any;

  peticionamentoSelecionado!: IPeticionamento;
  peticionamento?: IPeticionamento;

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;

  salvando = false;

  inscricao!: Subscription;

  editForm = this.fb.group({
    id: [0],
    resposta: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(5000),
      ],
    ],
  });

  constructor(
    protected peticionamentoService: PeticionamentoService,
    private exibirMensagemService: ExibirMensagemService,
    private dataService: DataService,
    protected router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.atualizarFormulario();
  }

  ngOnDestroy(): void {
    if (this.inscricao) this.inscricao.unsubscribe();
  }

  private atualizarFormulario(): void {
    const dados = this.dataService.receberObjeto();
    this.dataService.limparObjeto();

    this.recipiente = dados.recipiente;
    this.peticionamento = dados.objeto;

    this.peticionamentoSolicitacao = this.peticionamento!.solicitacao || '';
    this.peticionamentoDataCadastro = this.peticionamento!.dataCadastro || '';
    this.peticionamentoDocumento = this.peticionamento!.documento || '';
    this.peticionamentoEmail = this.peticionamento!.email || '';
    this.peticionamentoProtocolo = this.peticionamento!.protocolo || '';
    this.peticionamentoSolicitante = this.peticionamento!.solicitante || '';
    this.peticionamentoTipoDocumento = this.peticionamento!.tipoDocumento || '';

    this.editForm.patchValue({
      id: this.peticionamento?.id,
      resposta: this.peticionamento?.resposta,
    });
  }

  private criarFormulario(): IPeticionamento {
    return {
      ...new Peticionamento(),
      id: this.editForm.get(['id'])!.value,
      resposta: this.editForm.get(['resposta'])!.value,
      anexoResposta: this.anexo?.nome,
    };
  }

  protected concluir(): void {
    if (this.editForm.valid) {
      this.salvando = true;
      const peticionamento = this.criarFormulario();
      this.peticionamentoService
        .concluirPeticionamento(peticionamento)
        .subscribe({
          next: (resposta) => {
            this.exibirMensagemService.mensagem(
              'success',
              'Serviço de Mensagem',
              ['Peticionamento concluído com sucesso']
            );
            this.router.navigate(['/peticionamento']);
          },
          error: (resposta) => {
            this.exibirMensagemService.mensagem(
              'error',
              'Serviço de Mensagem',
              ['Erro ao concluir Peticionamento']
            );
          },
        });
    }
  }

  protected onReady(editor: any): void {
    const decoupledEditor = editor as DecoupledEditor;
    const element = decoupledEditor.ui.getEditableElement()!;
    const parent = element.parentElement!;
    parent.insertBefore(decoupledEditor.ui.view.toolbar.element!, element);
  }

  protected cancelar(): void {
    this.router.navigate(['/peticionamento']);
  }

  protected onAnexoSelecionado(evento: any) {
    const arquivo = evento.target.files[0];
    const fileSize = arquivo.size / 1024 / 1024; // para mb

    if (fileSize > 10) {
      console.log('O arquivo tem mais de 10mb!');
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'O arquivo tem mais de 10mb!',
      ]);
      return;
    }

    const info = arquivo.name.split('.');

    let payload = {
      arquivo: arquivo,
      enviado: false,
      metadata: {
        chaveArquivo: this.gerarChaveAleatoria(),
        extensao: info[1],
        nome: info[0],
        tamanho: arquivo.size,
      },
    };

    this.upload([payload]);
  }

  private upload(payloads: any[]) {
    if (typeof Worker !== 'undefined') {
      console.log('entrou');
      const worker = new Worker(
        new URL(
          '../../../../shared/workers/file-manager.worker',
          import.meta.url
        )
      );
      const url = config['apiUrl'];
      const token = window.sessionStorage.getItem('authenticationToken');

      worker.postMessage({ payloads, url, token });
      this.labelAnexo.nativeElement.innerText = 'Enviando...';
      this.labelAnexo.nativeElement.classList.add('disabled');
      worker.onmessage = (event) => {
        console.log(event.data);

        this.labelAnexo.nativeElement.innerText = 'Erro ao enviar';
        this.labelAnexo.nativeElement.classList.remove('disabled');

        if (event.data.enviado && event.data.nome != '') {
          this.labelAnexo.nativeElement.innerText = 'Enviado!';
          this.anexo = event.data;
        }
      };
    } else {
      console.log('not supported');
    }
  }

  private gerarChaveAleatoria(): string {
    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let chave = '';
    for (let i = 0; i < 16; i++) {
      chave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return chave;
  }
}
