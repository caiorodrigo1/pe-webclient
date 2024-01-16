import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
} from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { format, isValid } from 'date-fns';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

import { AssuntoProcessoService } from 'src/app/entities/crud/assunto-processo/assunto-processo.service';
import { TipoProcessoService } from 'src/app/entities/crud/tipo-processo/tipo-processo.service';
import { TemplateProcessoService } from 'src/app/entities/crud/template-processo/template-processo.service';
import { HipoteseLegalService } from 'src/app/entities/crud/hipotese-legal/hipotese-legal.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { AssuntoProcessoAtualizarComponent } from 'src/app/entities/crud/assunto-processo/components/assunto-processo-atualizar/assunto-processo-atualizar.component';
import { TipoProcessoAtualizarComponent } from 'src/app/entities/crud/tipo-processo/components/tipo-processo-atualizar/tipo-processo-atualizar.component';
import { HipoteseLegalAtualizarComponent } from 'src/app/entities/crud/hipotese-legal/components/hipotese-legal-atualizar/hipotese-legal-atualizar.component';
import { EDITORCONFIG } from 'src/app/shared/constants/config.constants';
import { Variaveis } from 'src/app/shared/models/variaveis.model';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoProcesso } from 'src/app/shared/models/tipo-processo.model';
import { ITemplateProcesso } from 'src/app/shared/models/template-processo.model';
import { IAssuntoProcesso } from 'src/app/shared/models/assunto-processo.model';
import { IHipoteseLegal } from 'src/app/shared/models/hipotese-legal.model';
import { IProcesso } from 'src/app/shared/models/processo.model';

@Component({
  selector: 'top-processo-geral',
  templateUrl: './processo-geral.component.html',
})
export class ProcessoGeralComponent implements OnInit, OnDestroy {
  @Input() processo!: IProcesso;
  @Input() editForm!: FormGroup;
  @Input() edicao!: number;
  @Input() variaveis!: Variaveis;
  @Output() dadosModificados: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  ref: DynamicDialogRef | undefined;

  assuntosProcesso: IAssuntoProcesso[] = [];
  tiposProcesso: ITipoProcesso[] = [];
  templatesProcesso: ITemplateProcesso[] = [];
  hipotesesLegais: IHipoteseLegal[] = [];
  naturezaAcessos = ['Interno', 'Externo'];

  hoje: Date = new Date();

  protected Editor = DecoupledEditor;
  protected editorConfig = EDITORCONFIG;

  inscricaoTiposProcesso!: Subscription;
  inscricaoAssuntosProcesso!: Subscription;
  inscricaoTemplatesProcesso!: Subscription;
  inscricaoTemplateProcesso!: Subscription;
  inscricaoHipotesesLegais!: Subscription;

  mostrarOpcoesNatureza: boolean = false;
  mostrarOpcoesNivelAcesso: boolean = false;
  mostraModoTramitacao: boolean = false;

  constructor(
    private tipoProcessoService: TipoProcessoService,
    private assuntoProcessoService: AssuntoProcessoService,
    private hipoteseLegalService: HipoteseLegalService,
    private templateProcessoService: TemplateProcessoService,
    private dialogService: DialogService,
    private exibirMensagemService: ExibirMensagemService
  ) {}

  ngOnInit(): void {
    this.editForm.get('tramitaMultSetor')?.disable();
    this.carregarProcesso$();
    this.atualizarFormulario();
  }

  ngOnDestroy(): void {
    if (this.inscricaoAssuntosProcesso)
      this.inscricaoAssuntosProcesso.unsubscribe();
    if (this.inscricaoTiposProcesso) this.inscricaoTiposProcesso.unsubscribe();
    if (this.inscricaoTemplatesProcesso)
      this.inscricaoTemplatesProcesso.unsubscribe();
    if (this.inscricaoTemplateProcesso)
      this.inscricaoTemplateProcesso.unsubscribe();
    if (this.inscricaoHipotesesLegais)
      this.inscricaoHipotesesLegais.unsubscribe();
  }

  private carregarProcesso$(): void {
    this.carregarTiposProcesso$();
    this.carregarAssuntosProcesso$();
    this.carregarHipotesesLegais$();
  }

  protected onReady(editor: DecoupledEditor): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(editor.ui.view.toolbar.element!, element);
  }

  protected dadosForamModificados(): void {
    this.dadosModificados.emit(true);
  }

  private carregarTiposProcesso$(): void {
    this.inscricaoTiposProcesso = this.tipoProcessoService
      .consultarTiposProcesso()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.tiposProcesso = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Tipos de Processo');
        },
      });
  }

  private carregarAssuntosProcesso$(): void {
    this.inscricaoAssuntosProcesso = this.assuntoProcessoService
      .consultarAssuntosProcesso()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.assuntosProcesso = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Assuntos de Processo');
        },
      });
  }

  private carregarHipotesesLegais$(): void {
    this.inscricaoHipotesesLegais = this.hipoteseLegalService
      .consultarHipotesesLegais()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.hipotesesLegais = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Hipóteses Legais');
        },
      });
  }

  private carregarTemplate$(id: number): void {
    this.inscricaoTemplatesProcesso = this.templateProcessoService
      .consultarTemplateProcessoByTipoProcesso(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.templatesProcesso = corpo!.data || [];
          const templateAtual = this.substituirVariaveis(
            this.templatesProcesso[0]!.texto!
          );
          this.editForm.controls['descricao'].setValue(templateAtual);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Templates');
        },
      });
  }

  private mudarTramitacao(modo: string, setarOpcao: boolean): void {
    console.log('valor: ', modo);
    if (modo === 'Sim') {
      this.editForm.get('tramitaMultSetor')?.disable();
      this.editForm.get('tramitaMultSetor')?.setValue('sim');
      this.mostraModoTramitacao = false;
    } else if (modo === 'Nao' || Number(modo) === 0) {
      this.editForm.get('tramitaMultSetor')?.disable();
      this.editForm.get('tramitaMultSetor')?.setValue('nao');
      this.mostraModoTramitacao = false;
    } else if (modo === 'AoCriarProcesso') {
      this.editForm.get('tramitaMultSetor')?.enable();
      if (setarOpcao) {
        const opcao = this.processo.tramitaMultSetor === true ? 'sim' : 'nao';
        this.editForm.get('tramitaMultSetor')?.setValue(opcao);
      } else {
        this.editForm.get('tramitaMultSetor')?.setValue(null);
      }
      this.mostraModoTramitacao = true;
    }
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      assunto: this.processo?.assunto,
      tipo: this.processo?.tipo,
      descricao: this.processo?.descricao || '',
      naturezaProcesso: this.processo?.naturezaProcesso || 'INTERNO',
      numeroOriginal: this.processo?.numeroOriginal,
      nivelAcesso: this.processo?.nivelAcesso || 'PUBLICO',
      hipoteseLegal: this.processo.hipoteseLegal,
      dataAutuacao: this.formatarData(this.processo?.dataAutuacao!) || null,
    });

    if (
      this.processo.tramitaMultSetor !== null &&
      this.processo.tramitaMultSetor !== undefined
    )
      this.mudarTramitacao(this.processo.tipo?.tramitaMultSetor!, true);

    if (this.processo.naturezaProcesso == 'EXTERNO')
      this.onChangeNaturezaProcesso(true);

    if (
      this.processo.nivelAcesso == 'RESTRITO' ||
      this.processo.nivelAcesso == 'SIGILOSO'
    )
      this.onChangeNivelAcesso(true);
  }

  private formatarData(data: string): string {
    if (this.isDataSimples(data)) return data;

    const dataTime = new Date(data || '');
    if (isValid(dataTime)) {
      return format(dataTime, 'dd/MM/yyyy');
    }
    return '';
  }

  private isDataSimples(data: string): boolean {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    return regex.test(data);
  }

  protected onChangeTipoProcesso(tipoProcesso: ITipoProcesso): void {
    if (tipoProcesso) {
      this.carregarTemplate$(tipoProcesso.id!);
      //this.mudarTramitacao(tipoProcesso.id!, false);
      this.mudarTramitacao(tipoProcesso.tramitaMultSetor!, false);
    }
  }

  protected onChangeTemplateProcesso(
    templateProcesso: ITemplateProcesso
  ): void {
    if (templateProcesso) {
      this.inscricaoTemplateProcesso = this.templateProcessoService
        .consultarTemplateProcesso(templateProcesso.id!)
        .subscribe({
          next: (resposta: HttpResponse<IEntidade>) => {
            const corpo = resposta.body;
            const templateAtual = this.substituirVariaveis(corpo!.data.texto);
            this.editForm.controls['descricao'].setValue(templateAtual);
          },
          error: (resposta: HttpErrorResponse) => {
            const erro: IEntidade = resposta.error;
            this.exibirErro(erro.message!, 'Buscar', 'Template');
          },
        });
    }
  }

  protected onChangeNaturezaProcesso(opcao: boolean): void {
    this.mostrarOpcoesNatureza = opcao;
    if (opcao) {
      this.editForm
        .get('numeroOriginal')
        ?.setValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ]);
      this.editForm.get('dataAutuacao')?.setValidators([Validators.required]);
    } else {
      this.editForm.get('numeroOriginal')?.clearValidators();
      this.editForm.get('dataAutuacao')?.clearValidators();
    }
    this.editForm.get('numeroOriginal')?.updateValueAndValidity();
    this.editForm.get('dataAutuacao')?.updateValueAndValidity();
  }

  protected onChangeNivelAcesso(opcao: boolean): void {
    this.mostrarOpcoesNivelAcesso = opcao;
    if (opcao) {
      this.editForm.get('hipoteseLegal')?.setValidators([Validators.required]);
    } else {
      this.editForm.get('hipoteseLegal')?.clearValidators();
    }
    this.editForm.get('hipoteseLegal')?.updateValueAndValidity();
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
    if (codigo === 'PE025') {
      this.exibirMensagemService.mensagem('warn', 'Serviço de Mensagem', [
        'Tipo Não Possui Template Próprio',
      ]);
      return;
    }
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  protected criarTipo_Processo(): void {
    this.ref = this.dialogService.open(TipoProcessoAtualizarComponent, {
      position: 'top',
      header: 'Criar Tipo de Processo',
      width: '100%',
      style: { maxWidth: '800px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      this.carregarTiposProcesso$();
    });
  }

  protected criarAssunto_Processo(): void {
    this.ref = this.dialogService.open(AssuntoProcessoAtualizarComponent, {
      position: 'top',
      header: 'Criar Assunto de Processo',
      width: '100%',
      style: { maxWidth: '800px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      this.carregarAssuntosProcesso$();
    });
  }

  protected criarHipoteseLegal(): void {
    this.ref = this.dialogService.open(HipoteseLegalAtualizarComponent, {
      position: 'top',
      header: 'Criar Hipótese Legal (LGPD)',
      width: '100%',
      style: { maxWidth: '800px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      this.carregarHipotesesLegais$();
    });
  }
}
