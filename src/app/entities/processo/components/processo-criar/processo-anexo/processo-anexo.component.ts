import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ProcessoService } from '../../../services/processo.service';
import { TipoAnexoService } from 'src/app/entities/crud/tipo-anexo/tipo-anexo.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { TipoAnexoAtualizarComponent } from 'src/app/entities/crud/tipo-anexo/components/tipo-anexo-atualizar/tipo-anexo-atualizar.component';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ITipoAnexo, TipoAnexo } from 'src/app/shared/models/tipo-anexo.model';
import { IProcesso } from 'src/app/shared/models/processo.model';
import { AnexoFile, IAnexoFile } from 'src/app/shared/models/anexo.model';
import { IAnexo } from 'src/app/shared/models/anexo.model';

@Component({
  selector: 'top-processo-anexo',
  templateUrl: './processo-anexo.component.html',
})
export class ProcessoAnexoComponent implements OnInit, OnDestroy {
  @Input() processo!: IProcesso;
  @Input() anexosAdicionados!: IAnexoFile[];
  @Input() anexosSalvos: IAnexo[] = [];
  @Input() signatarios: Boolean = false;

  @ViewChild('campoAnexo') campoAnexoRef!: ElementRef<HTMLInputElement>;

  ref: DynamicDialogRef | undefined;

  tipo!: TipoAnexo;
  tiposAnexo: ITipoAnexo[] = [];

  inscricaoTiposAnexo!: Subscription;
  inscricaoExcluir!: Subscription;

  excluindo: boolean = false;
  carregando: boolean = true;

  constructor(
    private tipoAnexoService: TipoAnexoService,
    private processoService: ProcessoService,
    private exibirMensagemService: ExibirMensagemService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.carregarTiposAnexo$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoExcluir) this.inscricaoExcluir.unsubscribe();
    if (this.inscricaoTiposAnexo) this.inscricaoTiposAnexo.unsubscribe();
  }

  private carregarTiposAnexo$(): void {
    this.inscricaoTiposAnexo = this.tipoAnexoService
      .consultarTipoAnexos()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.tiposAnexo = corpo!.data || [];
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Tipos de Anexo');
          this.carregando = false;
        },
      });
  }

  protected onAnexoSelecionado(campoAnexo: HTMLInputElement): void {
    const arquivo = campoAnexo.files?.[0];
    if (arquivo) {
      const fileSize = arquivo.size / 1024 / 1024; // para mb

      if (fileSize > 60) {
        console.log('O arquivo tem mais de 60mb!');
        this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
          'O Arquivo Tem Mais de 60MB!',
        ]);
        return;
      }
      this.adicionarAnexo(arquivo);
    }
  }

  private adicionarAnexo(arquivo: File): void {
    const info = arquivo.name.split('.');

    const anexo = {
      ...new AnexoFile(),
      chaveArquivo: this.gerarChaveAleatoria(),
      data: arquivo,
      nome: info[0],
      tamanho: arquivo.size,
      extensao: info[1],
      tipo: this.tipo,
    };

    const totalSize = this.anexosAdicionados.reduce(
      (total, current) => (total += current.tamanho!),
      anexo.tamanho
    );
    if (totalSize / 1024 / 1024 > 200) {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'O Total de Upload Não Pode Ser Maior que 200MB!',
      ]);

      return;
    }
    if (this.signatarios) this.anexosAdicionados.pop();

    this.anexosAdicionados.push(anexo);
  }

  protected excluirAnexo(chaveArquivo: string): void {
    this.excluirItem(chaveArquivo, this.anexosAdicionados, 'chaveArquivo');
  }

  protected excluirAnexoSalvo(anexoId: number): void {
    this.excluindo = true;
    this.inscricaoExcluir = this.processoService
      .excluirAnexo_Processo(anexoId)
      .subscribe({
        complete: () => {
          this.excluirItem(anexoId, this.anexosSalvos, 'id');
          this.excluindo = false;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Excluir', 'Anexo');
          this.excluindo = false;
        },
      });
  }

  private excluirItem<T>(
    chave: string | number,
    lista: T[],
    propriedade: string
  ): void {
    const indice = lista.findIndex(
      (item) => (item as Record<string, string>)[propriedade] == chave
    );
    if (indice > -1) {
      lista.splice(indice, 1);
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

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  protected criarTipo_Anexo(): void {
    this.ref = this.dialogService.open(TipoAnexoAtualizarComponent, {
      position: 'top',
      header: 'Criar Tipo de Anexo',
      width: '100%',
      style: { maxWidth: '800px' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
    });

    this.ref.onClose.subscribe(() => {
      this.carregarTiposAnexo$();
    });
  }

  protected exibirTipo(anexo: IAnexo): string {
    if (anexo.tipoAnexo) {
      return anexo.tipoAnexo.nome!;
    } else {
      const item = this.tiposAnexo.find(
        (tipo) => tipo.id === anexo.tipoAnexoId
      );
      return item!.nome || 'Desconhecido';
    }
  }
}
