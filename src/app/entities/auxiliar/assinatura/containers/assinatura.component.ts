import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
//import { MenuItem } from 'primeng/api';

import { AssinaturaService } from '../assinatura.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { AssinaturaConfirmarAcaoComponent } from '../components/assinatura-confirmar-acao.component';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IDocumentoAssinatura } from 'src/app/shared/models/documento-assinatura.model';
import { VisualizarDocumentoComponent } from 'src/app/shared/components/visualizar-documento/visualizar-documento.component';

@Component({
  selector: 'top-assinatura',
  templateUrl: './assinatura.component.html',
})
export class AssinaturaComponent implements OnInit, OnDestroy {
  entidade: string = 'Assinaturas';
  recipiente: string = 'Assinatura';
  tabelaAtual!: string;
  linkArquivo!: string;

  ref: DynamicDialogRef | undefined;

  assinatura!: IDocumentoAssinatura;
  assinaturas: IDocumentoAssinatura[] = [];
  assinaturasEnviadas: IDocumentoAssinatura[] = [];
  assinaturasRecebidas: IDocumentoAssinatura[] = [];
  tabelas: string[] = ['#recebidas', '#enviadas'];

  // opcoes1: MenuItem[];
  // opcoes2: MenuItem[];

  inscricaoRecebidas!: Subscription;
  inscricaoEnviadas!: Subscription;
  inscricaoAssinatura!: Subscription;

  carregandoRecebidas: boolean = true;
  carregandoEnviadas: boolean = true;

  // opcoesLista = {
  //   assinar: {
  //     label: 'Assinar',
  //     icon: 'pi pi-check-circle',
  //     command: () => this.mudarStatus(this.assinatura, 'ASSINAR'),
  //   },
  //   rejeitar: {
  //     label: 'Rejeitar',
  //     icon: 'pi pi-times-circle',
  //     command: () => this.mudarStatus(this.assinatura, 'REJEITAR'),
  //   },
  //   visualizar: {
  //     label: 'Visualizar',
  //     icon: 'pi pi-info',
  //     command: () => this.visualizarItem(this.assinatura),
  //   },
  //   baixar: {
  //     label: 'Baixar',
  //     icon: 'pi pi-download',
  //     command: () => this.baixarDocumento(this.assinatura),
  //   },
  // };

  cols!: any[];
  numCols = 0;

  page = 0;
  itemsPerPage = 10;
  totalRecords = 0;
  sort = ['id,asc'];
  globalFilter = '';

  event: LazyLoadEvent = {
    first: 0,
    rows: 10,
    sortOrder: 1,
    filters: {},
    globalFilter: null,
  };

  _selectedColumns!: IDefaultColumn[];
  selecionados: IDocumentoAssinatura[] = [];

  defaultColumns = [
    {
      field: 'tipo',
      header: 'Tipo',
      type: 'text',
      dataMap: 'tipo',
    },
    {
      field: 'dataEnvio',
      header: 'Data de Envio',
      type: 'datetime',
      dataMap: 'dataEnvio',
    },
    {
      field: 'usuarioOrigem',
      header: 'Usuário de Origem',
      type: 'text',
      dataMap: 'usuarioOrigem',
    },
    {
      field: 'usuarioDestino',
      header: 'Usuário de Destino',
      type: 'text',
      dataMap: 'usuarioDestino',
    },
    {
      field: 'statusSignatario',
      header: 'Situação',
      type: 'text',
      dataMap: 'statusSignatario',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private dialogService: DialogService,
    private assinaturaService: AssinaturaService,
    private exibirMensagemService: ExibirMensagemService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    const tab = this.elementRef.nativeElement.querySelector('#tab1');
    tab.classList.add('active');

    //this.criarMenu();
    this.carregarAssinaturasRecebidas$();
    this.carregarAssinaturasEnviadas$();
    //this.carregandoEnviadas = false;
    //this.carregandoRecebidas = false;
  }

  ngOnDestroy(): void {
    if (this.inscricaoAssinatura) this.inscricaoAssinatura.unsubscribe();
    if (this.inscricaoRecebidas) this.inscricaoRecebidas.unsubscribe();
    if (this.inscricaoEnviadas) this.inscricaoEnviadas.unsubscribe();
  }

  protected selecionarItem(item: IDocumentoAssinatura): void {
    this.assinatura = item;
  }

  set selectedColumns(val: IDefaultColumn[]) {
    this._selectedColumns = this.cols.filter((col) =>
      val.some((vCol) => col.field === vCol.field)
    );
    this.checkCols(this._selectedColumns.length);
  }

  private checkCols(length: number): void {
    this.numCols = length;
  }

  // private criarMenu(): void {
  //   this.opcoes1 = [
  //     this.opcoesLista.assinar,
  //     this.opcoesLista.rejeitar,
  //     this.opcoesLista.visualizar,
  //     this.opcoesLista.baixar,
  //   ];
  //   this.opcoes2 = [this.opcoesLista.visualizar, this.opcoesLista.baixar];
  // }

  protected filtrarColunas(): IDefaultColumn[] {
    const colunasPorTabela = {
      [this.tabelas[0]]: [
        'tipo',
        'dataEnvio',
        'usuarioOrigem',
        'statusSignatario',
      ],
      [this.tabelas[1]]: [
        'tipo',
        'dataEnvio',
        'usuarioDestino',
        'statusSignatario',
      ],
    };
    const colunasExibidas =
      colunasPorTabela[this.tabelaAtual] ||
      this.defaultColumns.map((col) => col.field);
    return this.defaultColumns.filter((col) =>
      colunasExibidas.includes(col.field)
    );
  }

  protected globalFilterFields(): string[] {
    return this.defaultColumns.map((x) => x.dataMap);
  }

  private carregarAssinaturasRecebidas$(): void {
    this.carregandoRecebidas = true;
    this.inscricaoRecebidas = this.assinaturaService
      .consultarAssinaturaRecebidas()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.assinaturasRecebidas = corpo!.data.reverse();
          this.carregandoRecebidas = false;
          this.mudarTabela(this.tabelas[0]);
        },
        error: (resposta: HttpErrorResponse) => {
          this.assinaturasRecebidas = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(
            erro.message!,
            'Buscar',
            `${this.assinaturasEnviadas} Recebidas`
          );
          this.carregandoRecebidas = false;
        },
      });
  }

  private carregarAssinaturasEnviadas$(): void {
    this.carregandoEnviadas = true;
    this.inscricaoEnviadas = this.assinaturaService
      .consultarAssinaturaEnviadas()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.assinaturasEnviadas = corpo!.data.reverse();
          this.carregandoEnviadas = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.assinaturasEnviadas = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(
            erro.message!,
            'Buscar',
            `${this.assinaturasEnviadas} Enviadas`
          );
          this.carregandoEnviadas = false;
        },
      });
  }

  protected verificarCarregamento(): boolean {
    if (this.tabelaAtual === this.tabelas[0]) return this.carregandoRecebidas;
    if (this.tabelaAtual === this.tabelas[1]) return this.carregandoEnviadas;
    return true;
  }

  protected mudarTabela(tabela: string): void {
    this.tabelaAtual = tabela;
    switch (tabela) {
      case this.tabelas[0]:
        this.assinaturas = this.assinaturasRecebidas;
        break;
      case this.tabelas[1]:
        this.assinaturas = this.assinaturasEnviadas;
        break;
      default:
        this.assinaturas = [];
    }
  }

  // protected getOpcoesPorTabela(): MenuItem[] {
  //   const opcoesPorTabela = {
  //     '#recebidas': this.opcoes1,
  //     '#enviadas': this.opcoes2,
  //   };

  //   return opcoesPorTabela[this.tabelaAtual] || this.opcoes2;
  // }

  protected visualizarItem(documento: IDocumentoAssinatura) {
    if (documento.nomeArquivo !== '') {
      if (documento.tipo === 'Documento') {
        this.visualizarDocumento(documento.linkArquivo!, true, false);
      } else {
        this.visualizarAnexo(documento);
      }
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'O Link Para o Arquivo Não Está Disponível',
      ]);
    }
  }

  private visualizarAnexo(documento: IDocumentoAssinatura): void {
    const extensao = documento.nomeArquivo!.substring(
      documento.nomeArquivo!.length - 3
    );
    if (extensao === 'pdf') {
      this.visualizarDocumento(documento.linkArquivo!, true, false);
    } else if (extensao === 'png' || extensao === 'jpg' || extensao === 'ico') {
      const link = `https://topdownfront.blob.core.windows.net/blobfront/anexos/${documento.nomeArquivo}`;
      this.visualizarDocumento(link, false, true);
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'Visualização Não é Possível Neste Formato de Arquivo',
      ]);
    }
  }

  protected visualizarDocumento(
    link: string,
    pdf: boolean,
    img: boolean
  ): void {
    this.ref = this.dialogService.open(VisualizarDocumentoComponent, {
      position: 'top',
      header: 'Visualização de Documento',
      width: '100%',
      height: '100%',
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
      data: {
        link: link,
        pdf: pdf,
        img: img,
      },
    });
  }

  protected baixarDocumento(documento: IDocumentoAssinatura): void {
    if (documento.nomeArquivo !== '') {
      if (documento.tipo === 'Documento') {
        window.open(documento.linkArquivo);
      } else {
        this.baixaAnexo(documento);
      }
    } else {
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        'O Link Para o Arquivo Não Está Disponível',
      ]);
    }
  }

  private baixaAnexo(documento: IDocumentoAssinatura): void {
    const extensao = documento.nomeArquivo!.substring(
      documento.nomeArquivo!.length - 3
    );
    if (extensao === 'pdf') {
      window.open(documento.linkArquivo);
    } else {
      const link = `https://topdownfront.blob.core.windows.net/blobfront/anexos/${documento.nomeArquivo}`;
      window.open(link);
    }
  }

  protected mudarStatus(documento: IDocumentoAssinatura, acao: string): void {
    if (acao === 'ASSINAR' || acao === 'REJEITAR') {
      this.ref = this.dialogService.open(AssinaturaConfirmarAcaoComponent, {
        position: 'top',
        header: 'Assinatura de Documento',
        contentStyle: { overflow: 'visible' },
        width: '500px',
        dismissableMask: true,
        data: {
          id: documento.pecaId,
          modelo: documento.tipo,
          acao: acao,
        },
      });

      this.ref.onClose.subscribe((result: boolean) => {
        if (result) this.carregarAssinaturasRecebidas$();
      });
    }
  }

  protected lazyLoad(event: TableLazyLoadEvent): void {
    this.event = JSON.parse(JSON.stringify(event));
    if (this.event.sortField)
      this.sort = [
        `${this.event.sortField},${
          this.event.sortOrder === 1 ? 'asc' : 'desc'
        }`,
      ];

    this.itemsPerPage = this.event.rows || 10;
    this.page = this.event.first! / this.itemsPerPage;

    this.carregarAssinaturasRecebidas$();
  }

  protected atualizarTela(table: Table): void {
    this.globalFilter = '';
    this.sort = ['id,asc'];
    table.reset();
  }

  protected linhaSelecionavel(event: any): boolean {
    return true;
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
