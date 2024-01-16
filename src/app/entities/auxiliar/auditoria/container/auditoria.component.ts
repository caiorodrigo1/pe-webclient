import { Component, Input, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { addDays, isBefore, format } from 'date-fns';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IProcesso } from 'src/app/shared/models/processo.model';
import { AuditoriaService } from '../auditoria.service';
import { IAuditoria } from 'src/app/shared/models/auditoria.model';
import { TableLazyLoadEvent } from 'primeng/table';
import { AuditoriaVisualizarComponent } from '../components/auditoria-visualizar.component';

@Component({
  selector: 'top-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss'],
})
export class AuditoriaComponent implements OnInit, OnDestroy {
  recipiente = 'Auditoria';
  entidade = 'Auditoria';
  auditoriaFiltrados: IAuditoria[] = [];

  ref: DynamicDialogRef | undefined;

  auditoria!: IAuditoria;

  inscricaoPesquisa!: Subscription;
  inscricaoVisualizar!: Subscription;

  hoje: Date = new Date();
  dataRange: Date = new Date();
  pesquisando = false;
  carregando = true;

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

  editForm = this.fb.group({
    id: [0],
    dataCriacaoInicio: ['', [Validators.required]],
    dataCriacaoFim: ['', [Validators.required]],
  });

  _selectedColumns!: IDefaultColumn[];
  selecionados: IProcesso[] = [];

  defaultColumns = [
    {
      field: 'usuario',
      header: 'Usuário',
      type: 'text',
      dataMap: 'usuario',
    },
    {
      field: 'casoDeUso',
      header: 'Caso de Uso',
      type: 'text',
      dataMap: 'casoDeUso',
    },
    {
      field: 'dataCadastro',
      header: 'Data de Cadastro',
      type: 'datetime',
      dataMap: 'dataCadastro',
    },
  ];

  constructor(
    private dialogService: DialogService,
    private exibirMensagemService: ExibirMensagemService,
    private auditoriaService: AuditoriaService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.carregando = false;
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoPesquisa) this.inscricaoPesquisa.unsubscribe();
    if (this.inscricaoVisualizar) this.inscricaoVisualizar.unsubscribe();
  }

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  private ajustarColunas(): void {
    this.cols = this.defaultColumns;
    this._selectedColumns = this.cols;
    this.checkCols(this._selectedColumns.length);
  }

  protected buscarFiltros() {
    const filtros = new Map<string, string>();

    const dataCriacaoInicio = format(
      new Date(this.editForm.get(['dataCriacaoInicio'])!.value),
      'yyyy-MM-dd'
    );

    const dataCriacaoFim = format(
      new Date(this.editForm.get(['dataCriacaoFim'])!.value),
      'yyyy-MM-dd'
    );

    filtros.set('dataInicio', dataCriacaoInicio);
    filtros.set('dataFim', dataCriacaoFim);
    return filtros;
  }

  protected pesquisar(): void {
    this.carregando = true;
    const filtros = this.buscarFiltros();
    this.inscricaoPesquisa = this.auditoriaService
      .pesquisaInterna(filtros)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.auditoriaFiltrados = corpo.data;
          this.auditoriaFiltrados!.reverse();
          this.carregando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.auditoriaFiltrados = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Pesquisar', this.entidade);
          this.carregando = false;
        },
      });
  }

  protected visualizarDados(id: number): void {
    this.inscricaoVisualizar = this.auditoriaService
      .consultarAuditoria(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto: IAuditoria = corpo!.data;
          this.exibirDados(objeto);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Consultar', this.entidade);
        },
      });
  }

  private exibirDados(auditoria: IAuditoria): void {
    this.ref = this.dialogService.open(AuditoriaVisualizarComponent, {
      position: 'top',
      header: 'Visualizar Auditoria',
      width: '100%',
      style: { overflow: 'auto', maxHeight: '90vh' },
      contentStyle: { overflow: 'visible' },
      dismissableMask: true,
      data: {
        auditoria: auditoria,
      },
    });
  }

  protected selecionarItem(item: IAuditoria) {
    this.auditoria = item;
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

  protected globalFilterFields(): string[] {
    return this.defaultColumns.map((x) => x.dataMap);
  }

  protected limpar(): void {
    this.editForm.reset();
    //window.location.reload();
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
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }

  protected rangeDate(dataInicio: any) {
    if (dataInicio) {
      this.dataRange = isBefore(addDays(dataInicio, 2), this.hoje)
        ? addDays(dataInicio, 2)
        : this.hoje;
    }
  }

  protected condicaoFimInicio(): boolean {
    return (
      this.editForm.get('dataCriacaoFim')!.value! <
      this.editForm.get('dataCriacaoInicio')!.value!
    );
  }

  protected condicaoJanelaDoisDias(dataInicio: any, dataFim: any): boolean {
    if (dataInicio && dataFim) {
      const dataLimite = addDays(dataInicio, 2);
      if (dataFim > dataLimite) {
        return true;
      }
    }
    return false;
  }
}
