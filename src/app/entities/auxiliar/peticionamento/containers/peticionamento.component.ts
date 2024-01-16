import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Table, TableLazyLoadEvent } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';

import { PeticionamentoService } from '../peticionamento.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { DataService } from 'src/app/shared/services/data.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import {
  IPeticionamento,
  Peticionamento,
} from 'src/app/shared/models/peticionamento.model';

@Component({
  selector: 'top-peticionamento',
  templateUrl: './peticionamento.component.html',
})
export class PeticionamentoComponent implements OnInit {
  entidade: string = 'Peticionamentos';
  recipiente: string = 'Peticionamentos';

  peticionamento!: IPeticionamento;
  peticionamentos: IPeticionamento[] = [];
  peticionamentosAbertos: IPeticionamento[] = [];
  peticionamentosConcluidos: IPeticionamento[] = [];

  inscricaoPeticionamentosAbertos?: Subscription;
  inscricaoPeticionamentosConcluidos?: Subscription;

  carregando: boolean = true;

  tabelas = ['#abertos', '#concluidos'];
  tabelaAtual: string = '';

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
  selecionados: IPeticionamento[] = [];

  defaultColumns = [
    {
      field: 'protocolo',
      header: 'Protocolo',
      type: 'text',
      dataMap: 'protocolo',
    },
    {
      field: 'solicitante',
      header: 'Solicitante',
      type: 'text',
      dataMap: 'solicitante',
    },
    {
      field: 'documento',
      header: 'Documento',
      type: 'text',
      dataMap: 'documento',
    },
    {
      field: 'dataCadastro',
      header: 'Data Cadastro',
      type: 'datetime',
      dataMap: 'dataCadastro',
    },
    {
      field: 'dataAtualizacao',
      header: 'Data Conclusão',
      type: 'datetime',
      dataMap: 'dataAtualizacao',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  constructor(
    private exibirMensagemService: ExibirMensagemService,
    private peticionamentoService: PeticionamentoService,
    private dataService: DataService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.ajustarTabela();
    this.carregarVisualizacao$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoPeticionamentosAbertos)
      this.inscricaoPeticionamentosAbertos.unsubscribe();
    if (this.inscricaoPeticionamentosConcluidos)
      this.inscricaoPeticionamentosConcluidos.unsubscribe();
  }

  private ajustarTabela(): void {
    const tab = this.elementRef.nativeElement.querySelector('#tab1');
    tab.classList.add('active');
    this.tabelaAtual = this.tabelas[0];
  }

  private ajustarColunas(): void {
    this.cols = this.defaultColumns;
    this._selectedColumns = this.cols;
    this.checkCols(this._selectedColumns.length);
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

  private carregarVisualizacao$(): void {
    this.carregando = true;
    //this.peticionamentosAbertos = [];
    //this.peticionamentosConcluidos = [];

    this.inscricaoPeticionamentosAbertos = this.peticionamentoService
      .consultarPeticionamentosAbertos()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.peticionamentosAbertos = corpo!.data.reverse() || [];
          this.carregando = false;
          this.mudarTabela(this.tabelas[0]);
        },
        error: (resposta: HttpErrorResponse) => {
          this.peticionamentosAbertos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });

    this.inscricaoPeticionamentosConcluidos = this.peticionamentoService
      .consultarPeticionamentosConcluidos()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.peticionamentosConcluidos = corpo!.data.reverse() || [];
          this.carregando = false;
          this.mudarTabela(this.tabelas[0]);
        },
        error: (resposta: HttpErrorResponse) => {
          this.peticionamentosConcluidos = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.entidade);
          this.carregando = false;
        },
      });
  }

  protected mudarTabela(tabela: string) {
    //this.montarMenuOpcoes(tabela);
    switch (tabela) {
      case this.tabelas[0]: //abertos
        this.tabelaAtual = this.tabelas[0];
        this.peticionamentos = this.peticionamentosAbertos;
        break;
      case this.tabelas[1]: //concluidos
        this.tabelaAtual = this.tabelas[1];
        this.peticionamentos = this.peticionamentosConcluidos;
        break;
      default:
        this.peticionamentos = [];
    }
    //this.definirColunas(tabela);
  }

  // private definirColunas(tabela: any): void {
  //   switch (tabela) {
  //     case this.tabelas[0]: //abertos
  //       this.defaultColumns = [
  //         {
  //           field: 'protocolo',
  //           header: 'Protocolo',
  //           type: 'text',
  //           dataMap: 'protocolo',
  //         },
  //         {
  //           field: 'solicitante',
  //           header: 'Solicitante',
  //           type: 'text',
  //           dataMap: 'solicitante',
  //         },
  //         {
  //           field: 'documento',
  //           header: 'Documento',
  //           type: 'text',
  //           dataMap: 'documento',
  //         },
  //         {
  //           field: 'dataCadastro',
  //           header: 'Data Cadastro',
  //           type: 'datetime',
  //           dataMap: 'dataCadastro',
  //         },
  //       ];
  //       break;
  //     case this.tabelas[1]: //concluidos
  //       this.defaultColumns = [
  //         {
  //           field: 'protocolo',
  //           header: 'Protocolo',
  //           type: 'text',
  //           dataMap: 'protocolo',
  //         },
  //         {
  //           field: 'solicitante',
  //           header: 'Solicitante',
  //           type: 'text',
  //           dataMap: 'solicitante',
  //         },
  //         {
  //           field: 'documento',
  //           header: 'Documento',
  //           type: 'text',
  //           dataMap: 'documento',
  //         },
  //         {
  //           field: 'dataCadastro',
  //           header: 'Data Cadastro',
  //           type: 'datetime',
  //           dataMap: 'dataCadastro',
  //         },
  //         {
  //           field: 'dataAtualizacao',
  //           header: 'Data Conclusão',
  //           type: 'datetime',
  //           dataMap: 'dataAtualizacao',
  //         },
  //       ];
  //       break;
  //     default:
  //       this.defaultColumns = [];
  //   }
  //   this.cols = this.defaultColumns;
  //   this._selectedColumns = this.cols;
  //   this.checkCols(this._selectedColumns.length);
  // }

  protected selecionarItem(item: IPeticionamento) {
    this.peticionamento = item;
  }

  protected globalFilterFields(): string[] {
    return this.defaultColumns.map((x) => x.dataMap);
  }

  // private getMessageErro(codigo) {
  //   let erro = CodigosErro[codigo];
  //   if (erro === undefined) erro = `erro no carregamento de ${codigo}`;
  //   return erro;
  // }

  // private tratarErro(resposta) {
  //   if (resposta.status == 400 && resposta.error) {
  //     this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
  //       this.getMessageErro(resposta.error.message),
  //     ]);
  //   } else {
  //     this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
  //       'Erro na operação',
  //     ]);
  //   }
  // }

  protected filtrarColunas(): IDefaultColumn[] {
    const colunasPorTabela = {
      [this.tabelas[0]]: [
        'protocolo',
        'solicitante',
        'documento',
        'dataCadastro',
      ],
      [this.tabelas[1]]: [
        'protocolo',
        'solicitante',
        'documento',
        'dataCadastro',
        'dataAtualizacao',
      ],
    };
    const colunasExibidas =
      colunasPorTabela[this.tabelaAtual] ||
      this.defaultColumns.map((col) => col.field);
    return this.defaultColumns.filter((col) =>
      colunasExibidas.includes(col.field)
    );
  }

  protected atualizarTela(table: Table): void {
    this.globalFilter = '';
    this.sort = ['id,asc'];
    table.reset();
  }

  protected linhaSelecionavel(event: any) {
    return true;
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

    this.carregarVisualizacao$();
  }

  // private montarMenuOpcoes(tabela: string) {
  //   switch (tabela) {
  //     case this.tabelas[0]: //abertos
  //       this.opcoes = [
  //         {
  //           label: 'Concluir',
  //           icon: 'pi pi-info',
  //           command: () => this.navegarConcluir(this.peticionamento),
  //         },
  //       ];
  //       break;
  //     default:
  //       this.peticionamentos = [];
  //   }
  // }

  protected navegarConcluir(peticionamento: Peticionamento): void {
    //const validar = this.validaComponentService.liberar(true);
    this.dataService.guardarObjeto({
      recipiente: 'Concluir Peticionamento',
      objeto: peticionamento,
    });
    this.router.navigate(['peticionamento/concluir']);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
