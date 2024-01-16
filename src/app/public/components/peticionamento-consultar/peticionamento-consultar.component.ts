import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { PeticionamentoService } from 'src/app/entities/auxiliar/peticionamento/peticionamento.service';
import { ClienteService } from 'src/app/shared/services/cliente.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ICliente } from 'src/app/shared/models/cliente.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import {
  IConsultaPublica,
  IPeticionamento,
} from 'src/app/shared/models/peticionamento.model';

@Component({
  selector: 'top-peticionamento-consultar',
  templateUrl: './peticionamento-consultar.component.html',
})
export class PeticionamentoConsultarComponent implements OnInit, OnDestroy {
  consulta: IConsultaPublica = {
    cliente: null,
    orgao: null,
    protocolo: '',
  };

  resposta!: IPeticionamento;

  listaOrgaos: IOrgao[] = [];
  listaClientes: ICliente[] = [];

  tenant: string = '';

  inscricaoClientes!: Subscription;
  inscricaoOrgaos!: Subscription;
  inscricaoConsulta!: Subscription;

  encontrado: boolean = false;
  salvando: boolean = false;
  carregando: boolean = false;
  clienteSelecionado: boolean = false;
  exibir: boolean = false;

  constructor(
    private peticionamentoService: PeticionamentoService,
    private clienteService: ClienteService,
    private orgaoService: OrgaoService,
    private exibirMensagemService: ExibirMensagemService
  ) {}

  ngOnInit(): void {
    this.carregarClientes$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoClientes) this.inscricaoClientes.unsubscribe();
    if (this.inscricaoOrgaos) this.inscricaoOrgaos.unsubscribe();
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
  }

  private carregarClientes$(): void {
    this.inscricaoClientes = this.clienteService
      .consultarClientesTop()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.listaClientes = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.listaClientes = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Clientes');
        },
      });
  }

  protected onChangeCliente(cliente: ICliente): void {
    if (cliente) {
      this.tenant = cliente.tenant!;
      this.carregarOrgaos();
      this.clienteSelecionado = true;
    }
  }

  private carregarOrgaos(): void {
    if (this.tenant) {
      this.inscricaoOrgaos = this.orgaoService
        .consultarOrgaosExterno(this.tenant)
        .subscribe({
          next: (resposta: HttpResponse<IEntidade>) => {
            const corpo = resposta.body;
            this.listaOrgaos = corpo!.data || [];
          },
          error: (resposta: HttpErrorResponse) => {
            this.listaOrgaos = [];
            const erro: IEntidade = resposta.error;
            this.exibirErro(erro.message!, 'Buscar', 'Órgãos');
          },
        });
    }
  }

  private verificarFiltros() {
    return !(
      this.consulta.cliente === null ||
      this.consulta.orgao === null ||
      this.consulta.protocolo === ''
    );
  }

  public pesquisar(): void {
    if (this.verificarFiltros()) {
      this.exibir = false;
      this.carregando = true;

      this.inscricaoConsulta = this.peticionamentoService
        .consultarPeticionamentoProtocolo(
          this.consulta.protocolo,
          this.tenant,
          this.consulta.orgao!.identificador!.toString()
        )
        .subscribe({
          next: (resposta: HttpResponse<IEntidade>) => {
            const corpo = resposta.body;
            this.resposta = corpo!.data || {};
            //console.log('resposta: ', this.resposta);
            this.carregando = false;
            this.exibir = true;
          },
          error: (resposta: HttpErrorResponse) => {
            const erro: IEntidade = resposta.error;
            this.exibirErro(erro.message!, 'Buscar', 'Peticionamento');
            this.carregando = false;
            this.exibir = false;
          },
        });
    } else {
      this.exibirMensagemService.mensagem(
        'error',
        'Serviço de Mensagem',
        ['Informe Todos os Filtros da Pesquisa'],
        'app'
      );
    }
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
