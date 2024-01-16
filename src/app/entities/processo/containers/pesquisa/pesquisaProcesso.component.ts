import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { format } from 'date-fns';

import { ProcessoService } from '../../services/processo.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { ValidaComponentService } from 'src/app/shared/services/valida-component.service';
import { DataService } from 'src/app/shared/services/data.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IProcesso } from 'src/app/shared/models/processo.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import { ISetor } from 'src/app/shared/models/setor.model';
import { TableLazyLoadEvent } from 'primeng/table';
// import { ProcessoTramitacaoComponent } from '../../components/processo-tramitar/processo-tramitacao.component';
// import { ProcessoDistribuirComponent } from '../../components/processo-distribuir/processo-distribuir.component';
// import { ProcessoArquivarComponent } from '../../components/processo-arquivar/processo-arquivar.component';

@Component({
  selector: 'top-pesquisaprocesso',
  templateUrl: './pesquisaprocesso.component.html',
  styleUrls: ['./pesquisaprocesso.component.scss'],
})
export class PesquisaProcessoComponent implements OnInit, OnDestroy {
  //entidade: 'Processo';
  recipiente: string = 'Pesquisa';

  processosFiltrados: IProcesso[] = [];

  orgaos!: IOrgao[];
  setores!: ISetor[];

  //rota: string = `processo/pesquisa`;
  pesquisando = false;
  hoje: Date = new Date();

  inscricaoPesquisa!: Subscription;
  inscricaoOrgaos!: Subscription;
  inscricaoSetores!: Subscription;

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
  selecionados: IProcesso[] = [];

  defaultColumns = [
    {
      field: 'numeroProcesso',
      header: 'Número',
      type: 'text',
      dataMap: 'numeroProcesso',
    },
    {
      field: 'tipo.nome',
      header: 'Tipo',
      type: 'text',
      dataMap: 'tipo.nome',
    },
    {
      field: 'assunto.nome',
      header: 'Assunto',
      type: 'text',
      dataMap: 'assunto.nome',
    },
    {
      field: 'dataCadastro',
      header: 'Data de Cadastro',
      type: 'datetime',
      dataMap: 'dataCadastro',
    },
  ];

  @Input() get selectedColumns(): IDefaultColumn[] {
    return this._selectedColumns;
  }

  editForm = this.fb.group({
    numero: [
      '',
      [Validators.required, Validators.minLength(15), Validators.maxLength(15)],
    ],
    orgao: [''],
    setor: [{ value: '', disabled: true }],
    interessados: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    assunto: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    dataCriacaoInicio: ['', [Validators.required]],
    dataCriacaoFim: ['', [Validators.required]],
    conteudo: ['', Validators.maxLength(200)],
  });

  constructor(
    private processoService: ProcessoService,
    private orgaoService: OrgaoService,
    private validaComponentService: ValidaComponentService,
    private exibirMensagemService: ExibirMensagemService,
    private dataService: DataService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // this.opcoes1 = [
    //   {
    //     label: 'Tramitar',
    //     icon: 'pi pi-sign-in',
    //     command: () => this.tramitar(this.processo),
    //   },
    //   {
    //     label: 'Distribuir',
    //     icon: 'pi pi-sign-in',
    //     command: () => this.distribuir(this.processo),
    //   },
    // ];
    // this.opcoes2 = [
    //   {
    //     label: 'Tramitar',
    //     icon: 'pi pi-sign-in',
    //     command: () => this.tramitar(this.processo),
    //   },
    //   {
    //     label: 'Distribuir',
    //     icon: 'pi pi-sign-in',
    //     command: () => this.distribuir(this.processo),
    //   },
    //   {
    //     label: 'Despacho',
    //     icon: 'pi pi-plus',
    //     command: () => this.adicionarDespacho(this.processo),
    //   },
    //   {
    //     label: 'Arquivar',
    //     icon: 'pi pi-verified',
    //     command: () => this.arquivar(this.processo),
    //   },
    // ];
  }

  ngOnInit(): void {
    this.carregarOrgaos$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoPesquisa) this.inscricaoPesquisa.unsubscribe();
    if (this.inscricaoOrgaos) this.inscricaoOrgaos.unsubscribe();
    if (this.inscricaoSetores) this.inscricaoSetores.unsubscribe();
  }

  private ajustarColunas(): void {
    this.cols = this.defaultColumns;
    this._selectedColumns = this.cols;
    this.checkCols(this._selectedColumns.length);
  }

  private carregarOrgaos$(): void {
    this.inscricaoOrgaos = this.orgaoService.consultarOrgaos().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.orgaos = corpo!.data || [];
      },
      error: (resposta: HttpErrorResponse) => {
        this.orgaos = [];
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', 'Órgãos');
      },
    });
  }

  protected onChangeOrgao(orgaoId: number): void {
    if (orgaoId) {
      this.carregarSetores$(orgaoId);
      this.editForm.get('setor')!.setValue(null);
    }
  }

  private carregarSetores$(id: number): void {
    this.inscricaoSetores = this.orgaoService
      .consultarSetoresPorOrgaoId(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.setores = corpo!.data || [];
          this.editForm.get('setor')?.enable();
        },
        error: (resposta: HttpErrorResponse) => {
          this.setores = [];
          this.editForm.get('setor')?.enable();
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Setores');
        },
      });
  }

  protected buscarFiltros() {
    const filtros = new Map<string, string>();

    let dataCriacaoInicio = '';
    let dataCriacaoFim = '';
    if (
      this.editForm.get(['dataCriacaoInicio'])!.value &&
      this.editForm.get(['dataCriacaoFim'])!.value
    ) {
      dataCriacaoInicio = format(
        new Date(this.editForm.get(['dataCriacaoInicio'])!.value),
        'yyyy-MM-dd'
      );
      dataCriacaoFim = format(
        new Date(this.editForm.get(['dataCriacaoFim'])!.value),
        'yyyy-MM-dd'
      );
    }

    filtros.set('numero', this.editForm.get(['numero'])?.value || '');
    filtros.set('orgaoId', this.editForm.get(['orgao'])?.value?.id || '');
    filtros.set('setorId', this.editForm.get(['setor'])?.value?.id || '');
    filtros.set(
      'interessados',
      this.editForm.get(['interessados'])?.value || ''
    );
    filtros.set('assunto', this.editForm.get(['assunto'])?.value || '');
    filtros.set('dataInicio', dataCriacaoInicio);
    filtros.set('dataFim', dataCriacaoFim);
    filtros.set('conteudo', this.editForm.get(['conteudo'])?.value || '');
    return filtros;
  }

  protected pesquisar(): void {
    this.pesquisando = true;
    const filtros = this.buscarFiltros();
    //console.log('filtros: ', filtros);
    this.inscricaoPesquisa = this.processoService
      .pesquisaInterna(filtros)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.processosFiltrados = corpo!.data.reverse() || [];
          this.pesquisando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.processosFiltrados = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Pesquisar', 'Processos');
          this.pesquisando = false;
        },
      });
  }

  protected tramitar(processo: IProcesso): void {
    // const modalRef = this.modal.open(ProcessoTramitacaoComponent, {
    //   backdrop: 'static',
    // });
    // modalRef.componentInstance.processo = processo;
  }

  protected distribuir(processo: IProcesso): void {
    // const modalRef = this.modal.open(ProcessoDistribuirComponent, {
    //   backdrop: 'static',
    // });
    // modalRef.componentInstance.processo = processo;
  }

  protected arquivar(processo: IProcesso): void {
    // const modalRef = this.modal.open(ProcessoArquivarComponent, {
    //   backdrop: 'static',
    // });
    // modalRef.componentInstance.processo = processo;
  }

  protected visualizarDados(id: number): void {
    // this.validaComponentService.liberar(true);
    // this.router.navigate([`./visualizar/${id}`], {
    //   relativeTo: this.activatedRoute,
    // });
  }

  private adicionarDespacho(processo: IProcesso) {
    // this.validaComponentService.liberar(true);
    // this.inscricaoVisualizar = this.processoService
    //   .consultarProcesso(processo.id)
    //   .subscribe({
    //     next: (resposta) => {
    //       const res: any = resposta.body;
    //       const objeto = res.data || [];
    //       this.dataService.guardarObjeto({
    //         recipiente: this.recipiente,
    //         rota: this.rota,
    //         objeto: objeto,
    //       });
    //       this.router.navigate([`processo/pesquisa/adicionar-despacho`]);
    //     },
    //     error: (resposta) => {
    //       console.log('erro: ', resposta);
    //       const codigo = resposta.error.message;
    //       this.exibirErro(codigo, this.entidade);
    //     },
    //   });
  }

  protected habilitarPesquisa(): boolean {
    if (this.pesquisando) return true;
    const numero = this.editForm.get('numero')?.value;
    const dataInicio = this.editForm.get('dataCriacaoInicio')?.value;
    const dataFim = this.editForm.get('dataCriacaoFim')?.value;

    if (
      (dataInicio && !dataFim) ||
      (!dataInicio && dataFim) ||
      (dataInicio && dataFim && dataFim < dataInicio)
    ) {
      return true;
    }

    return !(numero || (dataInicio && dataFim));
  }

  // protected selecionarItem(item: IProcesso) {
  //   this.processo = item;
  // }

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
}
