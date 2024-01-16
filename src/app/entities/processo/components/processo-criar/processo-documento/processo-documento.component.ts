import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
} from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { TipoDocumentoService } from 'src/app/entities/crud/tipo-documento/tipo-documento.service';
import { TemplateDocumentoService } from 'src/app/entities/crud/template-documento/template-documento.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { TipoDocumentoAtualizarComponent } from 'src/app/entities/crud/tipo-documento/components/tipo-documento-atualizar/tipo-documento-atualizar.component';
import { EDITORCONFIG } from 'src/app/shared/constants/config.constants';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { Variaveis } from 'src/app/shared/models/variaveis.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITemplateDocumento } from 'src/app/shared/models/template-documento.model';
import { ITipoDocumento } from 'src/app/shared/models/tipo-documento.model';
import { IProcesso } from 'src/app/shared/models/processo.model';
import { Documento, IDocumento } from 'src/app/shared/models/documento.model';

@Component({
  selector: 'top-processo-documento',
  templateUrl: './processo-documento.component.html',
})
export class ProcessoDocumentoComponent implements OnInit, OnDestroy {
  @Input() processo!: IProcesso;
  @Input() editForm!: FormGroup;
  @Input() documentosAdicionados!: IDocumento[];
  @Input() numeroDocumento!: number;
  @Input() variaveis!: Variaveis;
  @Input() signatarios: boolean = false;
  @Output() dadosModificados: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  ref: DynamicDialogRef | undefined;

  tiposDocumento: ITipoDocumento[] = [];
  templatesDocumento: ITemplateDocumento[] = [];

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;

  inscricaoTiposDocumento!: Subscription;
  inscricaoTemplatesDocumento!: Subscription;
  inscricaoTemplateDocumento!: Subscription;

  constructor(
    private tipoDocumentoService: TipoDocumentoService,
    private templateDocumentoService: TemplateDocumentoService,
    private exibirMensagemService: ExibirMensagemService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.numeroDocumento = 1;
    this.carregarTiposDocumento$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoTiposDocumento)
      this.inscricaoTiposDocumento.unsubscribe();
    if (this.inscricaoTemplatesDocumento)
      this.inscricaoTemplatesDocumento.unsubscribe();
    if (this.inscricaoTemplateDocumento)
      this.inscricaoTemplateDocumento.unsubscribe();
  }

  protected onReady(editor: DecoupledEditor): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(editor.ui.view.toolbar.element!, element);
  }

  protected dadosForamModificados(): void {
    this.dadosModificados.emit(true);
  }

  private carregarTiposDocumento$(): void {
    this.inscricaoTiposDocumento = this.tipoDocumentoService
      .consultarTiposDocumento()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.tiposDocumento = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Tipos de Documento');
        },
      });
  }

  private carregarTemplate$(id: number): void {
    this.inscricaoTemplatesDocumento = this.templateDocumentoService
      .consultarTemplateDocumentoByTipoDocumento(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.templatesDocumento = corpo!.data || [];
          const templateAtual = this.substituirVariaveis(
            this.templatesDocumento[0].template!
          );
          this.editForm.controls['conteudo'].setValue(templateAtual);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Templates');
        },
      });
  }

  protected onChangeTipoDocumento(tipoDocumento: ITipoDocumento): void {
    if (tipoDocumento) this.carregarTemplate$(tipoDocumento.id!);
  }

  protected onChangeTemplateDocumento(templateDocumento: any): void {
    if (templateDocumento) {
      this.inscricaoTemplateDocumento = this.templateDocumentoService
        .consultarTemplateDocumento(templateDocumento.id)
        .subscribe({
          next: (resposta: HttpResponse<IEntidade>) => {
            const corpo = resposta.body;
            const templateAtual = this.substituirVariaveis(
              corpo!.data.template
            );
            this.editForm.controls['conteudo'].setValue(templateAtual);
          },
          error: (resposta: HttpErrorResponse) => {
            const erro: IEntidade = resposta.error;
            this.exibirErro(erro.message!, 'Buscar', 'Template');
          },
        });
    }
  }

  protected adicionarDocumento(): void {
    const documento = {
      ...new Documento(),
      numeroDocumento: this.numeroDocumento,
      tipoDocumentoId: this.editForm.get(['tipo'])!.value.id,
      tipoDocumento: this.editForm.get(['tipo'])!.value,
      numero: this.editForm.get(['numero'])!.value,
      assunto: this.editForm.get(['assunto'])!.value,
      observacao: this.editForm.get(['observacao'])!.value,
      conteudo: this.substituirVariaveis(
        this.editForm.get(['conteudo'])!.value
      ),
    };

    this.documentosAdicionados.push(documento);
    this.numeroDocumento++;

    this.dadosForamModificados();
    this.limparCampos();
  }

  private limparCampos(): void {
    this.editForm.patchValue({
      tipo: null,
      numero: null,
      assunto: null,
      conteudo: null,
      observacao: null,
    });
    this.editForm.get('tipo')?.markAsUntouched();
    this.editForm.get('numero')?.markAsUntouched();
    this.editForm.get('assunto')?.markAsUntouched();
    this.editForm.get('conteudo')?.markAsUntouched();
    this.templatesDocumento = [];
  }

  protected excluirDocumento(numero: number): void {
    const indice = this.documentosAdicionados.findIndex(
      (item) => item.numeroDocumento == numero
    );
    if (indice > -1) {
      this.documentosAdicionados.splice(indice, 1);
      this.dadosForamModificados();
    }
  }

  private substituirVariaveis(texto: string): string {
    const variaveis = this.variaveis;
    return texto.replace(
      /\$(\w+)\$/g,
      (match, variavel) =>
        (variaveis as Record<string, string>)[variavel] ?? match
    );
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    if (codigo === 'PE038') {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        'Tipo Não Possui Template Próprio',
      ]);
      return;
    }
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  protected criarTipo_Documento(): void {
    this.ref = this.dialogService.open(TipoDocumentoAtualizarComponent, {
      position: 'top',
      header: 'Criar Tipo de Documento',
      width: '100%',
      style: { maxWidth: '800px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      this.carregarTiposDocumento$();
    });
  }
}
