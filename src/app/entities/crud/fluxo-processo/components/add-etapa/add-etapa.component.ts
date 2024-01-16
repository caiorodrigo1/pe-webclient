import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { TipoDocumentoService } from 'src/app/entities/crud/tipo-documento/tipo-documento.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IOrgao } from 'src/app/shared/models/orgao.model';
import { ISetor } from 'src/app/shared/models/setor.model';
import { ITipoDocumento } from 'src/app/shared/models/tipo-documento.model';
import {
  EtapaFluxo,
  IEtapaFluxo,
} from 'src/app/shared/models/fluxo-processo.model';

@Component({
  selector: 'app-add-etapa',
  templateUrl: './add-etapa.component.html',
})
export class AddEtapaComponent implements OnInit, OnDestroy {
  etapa: IEtapaFluxo = new EtapaFluxo();

  orgaos: IOrgao[] = [];
  setores: ISetor[] = [];
  tiposDocumento: ITipoDocumento[] = [];

  incricaoOrgaos: Subscription = new Subscription();
  incricaoSetores: Subscription = new Subscription();
  incricaoTiposDocumento: Subscription = new Subscription();

  constructor(
    private tipoDocumentoService: TipoDocumentoService,
    private exibirMensagemService: ExibirMensagemService,
    private orgaoService: OrgaoService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.carregarOrgaos$();
    this.carregarTiposDocumento$();
  }

  ngOnDestroy(): void {
    if (this.incricaoOrgaos) this.incricaoOrgaos.unsubscribe();
    if (this.incricaoSetores) this.incricaoSetores.unsubscribe();
    if (this.incricaoTiposDocumento) this.incricaoTiposDocumento.unsubscribe();
  }

  private carregarOrgaos$(): void {
    this.incricaoOrgaos = this.orgaoService.consultarOrgaos().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body || { data: [] };
        this.orgaos = corpo.data;
      },
      error: (resposta: HttpErrorResponse) => {
        this.orgaos = [];
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message || '', 'Buscar', 'Órgãos');
      },
    });
  }

  protected onChangeOrgao(orgaoId: number): void {
    if (orgaoId) this.carregarSetores$(orgaoId);
  }

  private carregarSetores$(id: number) {
    this.incricaoSetores = this.orgaoService
      .consultarSetoresPorOrgaoId(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.setores = corpo.data;
        },
        error: (resposta: HttpErrorResponse) => {
          this.setores = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', 'Setores');
        },
      });
  }

  private carregarTiposDocumento$(): void {
    this.incricaoTiposDocumento = this.tipoDocumentoService
      .consultarTiposDocumento()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body || { data: [] };
          this.tiposDocumento = corpo.data;
        },
        error: (resposta: HttpErrorResponse) => {
          this.tiposDocumento = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message || '', 'Buscar', 'Tipos de Documento');
        },
      });
  }

  protected adicionar(): void {
    const { nome, descricao, orgao, setor, tipoDocumento } = this.etapa;

    if (!nome || !descricao || !orgao || !setor || !tipoDocumento) {
      const mensagem = 'Preencha todas as informações da Etapa';
      this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [
        mensagem,
      ]);
    } else {
      this.etapa.fluxoProcessoId = this.config.data.fluxoId;
      this.etapa.orgaoId = orgao.id;
      this.etapa.setorId = setor.id;
      this.etapa.tipoDocumentoId = tipoDocumento.id;

      this.ref.close(this.etapa);
    }
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
