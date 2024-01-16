import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { format } from 'date-fns';

import { ProcessoService } from 'src/app/entities/processo/services/processo.service';
import { ClienteService } from 'src/app/shared/services/cliente.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { IDefaultColumn } from 'src/app/shared/models/default-column.model';
import { ICliente } from 'src/app/shared/models/cliente.model';
import { IInteressadoProcesso } from 'src/app/shared/models/interessado-processo.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import { IProcesso } from 'src/app/shared/models/processo.model';
import { ISetor } from 'src/app/shared/models/setor.model';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';

@Component({
  selector: 'top-consulta-publica',
  templateUrl: './consulta-publica.component.html',
})
export class ConsultaPublicaComponent implements OnInit, OnDestroy {
  cliente!: ICliente;
  processo: IProcesso = {
    tramitacoes: [],
  };

  dataMax: Date = new Date();

  processoLista: IProcesso[] = [];
  clienteLista: ICliente[] = [];
  orgaoLista: IOrgao[] = [];
  setorLista: ISetor[] = [];
  interessadoLista: IInteressadoProcesso[] = [];

  inscricaoCliente!: Subscription;
  inscricaoOrgao!: Subscription;
  inscricaoSetor!: Subscription;
  inscricaoInteressado!: Subscription;
  inscricaoProcesso!: Subscription;
  inscricaoTramitacoes!: Subscription;

  clienteSelecionado: boolean = false;
  pesquisaRealizada: boolean = false;
  erroDatas: boolean = false;
  buscando: boolean = false;
  exibir: boolean = false;
  carregado: boolean = false;

  editForm = this.formBuilder.group({
    numeroProcesso: [''],
    orgao: [{ value: '', disabled: true }],
    setor: [{ value: '', disabled: true }],
    interessado: [''],
    dataInicial: [{ value: '', disabled: false }],
    dataFinal: [{ value: '', disabled: false }],
  });

  cols!: any[];
  numCols = 0;

  _selectedColumns!: IDefaultColumn[];
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

  constructor(
    private clienteService: ClienteService,
    private orgaoService: OrgaoService,
    private processoService: ProcessoService,
    private exibirMensagemService: ExibirMensagemService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.carregarClientes$();
    this.ajustarColunas();
  }

  ngOnDestroy(): void {
    if (this.inscricaoCliente) this.inscricaoCliente.unsubscribe();
    if (this.inscricaoOrgao) this.inscricaoOrgao.unsubscribe();
    if (this.inscricaoSetor) this.inscricaoSetor.unsubscribe();
    if (this.inscricaoInteressado) this.inscricaoInteressado.unsubscribe();
    if (this.inscricaoProcesso) this.inscricaoProcesso.unsubscribe();
    if (this.inscricaoTramitacoes) this.inscricaoTramitacoes.unsubscribe();
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

  private carregarClientes$(): void {
    this.inscricaoCliente = this.clienteService
      .consultarClientesTop()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.clienteLista = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.clienteLista = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Clientes');
        },
      });
  }

  protected verificarCliente(): void {
    this.setorLista = [];
    this.editForm.get('setor')?.setValue('');
    this.carregarOrgaos$();
  }

  private carregarOrgaos$(): void {
    this.inscricaoOrgao = this.orgaoService
      .consultarOrgaosExterno(this.cliente.tenant!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.orgaoLista = corpo!.data || [];
          this.editForm.get('orgao')?.enable();
        },
        error: (resposta: HttpErrorResponse) => {
          this.orgaoLista = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Órgãos');
        },
      });
  }

  protected verificarOrgao(orgao: IOrgao): void {
    this.editForm.get('setor')?.setValue('');
    this.carregarSetores$(orgao.id!);
  }

  private carregarSetores$(id: number): void {
    this.inscricaoSetor = this.orgaoService
      .consultarSetoresExternamente(id, this.cliente.tenant!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo: any = resposta.body;
          this.setorLista = corpo.data || [];
          this.editForm.get('setor')?.enable();
        },
        error: (resposta: HttpErrorResponse) => {
          this.setorLista = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Setores');
        },
      });
  }

  private carregarProcesso$(request: any): void {
    this.inscricaoProcesso = this.processoService
      .pesquisarProcessosExternamente(request, this.cliente.tenant!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo: any = resposta.body;
          const objeto = corpo.data.reverse() || [];
          this.processoLista = objeto;
          this.pesquisaRealizada = true;
          this.buscando = false;
        },
        error: (resposta: HttpErrorResponse) => {
          this.processoLista = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Processos');
          this.pesquisaRealizada = true;
          this.buscando = false;
        },
      });
  }

  protected limpar(): void {
    this.editForm.get('numeroProcesso')?.reset();
    this.editForm.get('interessado')?.reset();
    this.editForm.get('dataInicial')?.reset();
    this.editForm.get('dataFinal')?.reset();
    this.editForm.get('orgao')?.reset();
    this.editForm.get('setor')?.reset();
    this.editForm.get('setor')?.disable();
  }

  protected verificarData(): void {
    const dataInicialValor = this.editForm.get(['dataInicial'])!.value;
    const dataFinalValor = this.editForm.get(['dataFinal'])!.value;
    this.erroDatas =
      dataInicialValor && dataFinalValor && dataFinalValor < dataInicialValor;
  }

  protected habilitarPesquisa(): boolean {
    if (!this.cliente) return true;
    if (this.buscando || this.erroDatas) return true;

    const numeroProcesso = this.editForm.get('numeroProcesso')?.value;
    const interessado = this.editForm.get('interessado')?.value;
    const dataInicio = this.editForm.get('dataInicial')?.value;
    const dataFim = this.editForm.get('dataFinal')?.value;
    const orgao = this.editForm.get('orgao')?.value;

    if (numeroProcesso || interessado || dataInicio || dataFim || orgao)
      return false;

    return true;
  }

  protected pesquisar(): void {
    if (this.habilitarPesquisa() === false) {
      this.buscando = true;
      this.exibir = true;

      const dataInicio = this.editForm.get(['dataInicial'])!.value
        ? format(
            new Date(this.editForm.get(['dataInicial'])!.value),
            'yyyy-MM-dd'
          )
        : '';

      const dataFim = this.editForm.get(['dataFinal'])!.value
        ? format(
            new Date(this.editForm.get(['dataFinal'])!.value),
            'yyyy-MM-dd'
          )
        : '';

      const request = {
        numero: this.editForm.get('numeroProcesso')?.value || '',
        interessado: this.editForm.get('interessado')?.value || '',
        dataInicio: dataInicio,
        dataFim: dataFim,
        orgaoId: this.editForm.get(['orgao'])?.value?.id || '',
        setorId: this.editForm.get(['setor'])?.value?.id || '',
      };

      this.carregarProcesso$(request);
    }
  }

  protected consutarProcesso(numeroProcesso: string): void {
    this.inscricaoTramitacoes = this.processoService
      .consultarProcessoExternamente(numeroProcesso, this.cliente.tenant!)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          const objeto = corpo!.data || {};
          this.processo = objeto;
          this.carregado = true;
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Processo');
          this.carregado = true;
        },
      });
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    if (codigo === 'PE035') {
      this.exibirMensagemService.mensagem(
        'warn',
        'Serviço de Mensagem',
        ['Nenhum Resultado'],
        'app'
      );
      return;
    }

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
