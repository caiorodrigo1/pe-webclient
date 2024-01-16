import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { CodigosErro } from '../../enums/codigos-erro.enum';
import { IOrgao } from '../../models/orgao.model';
import { IUsuario } from '../../models/usuario.model';
import { IEntidade } from '../../models/entidade-response.model';

@Component({
  selector: 'top-signatario-modal',
  templateUrl: './signatario-modal.component.html',
})
export class SignatarioModalComponent implements OnInit, OnDestroy {
  listaUsuarios!: IUsuario[];
  usuariosSignatario!: IUsuario[];

  listaOrgao!: IOrgao[];
  orgaoSelected!: IOrgao;

  orgaoIndefinido!: boolean;

  inscricaoOrgao!: Subscription;
  inscricaoUsuario!: Subscription;

  constructor(
    private orgaoService: OrgaoService,
    private exibirMensagemService: ExibirMensagemService,
    private ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.orgaoIndefinido = true;
    this.carregarOrgaos$();
  }

  ngOnDestroy(): void {
    if (this.inscricaoOrgao) this.inscricaoOrgao.unsubscribe();
    if (this.inscricaoUsuario) this.inscricaoUsuario.unsubscribe();
  }

  private carregarOrgaos$(): void {
    this.inscricaoOrgao = this.orgaoService.consultarOrgaos().subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.listaOrgao = corpo!.data || [];
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', `Órgãos`);
      },
    });
  }

  protected onChangeOrgao(orgao: IOrgao): void {
    if (orgao) {
      this.orgaoIndefinido = false;
      this.carregarUsuarios$(orgao.id!);
    }
  }

  private carregarUsuarios$(id: number): void {
    this.inscricaoOrgao = this.orgaoService.consultarUsuarios(id).subscribe({
      next: (resposta: HttpResponse<IEntidade>) => {
        const corpo = resposta.body;
        this.listaUsuarios = corpo!.data || [];
        if (corpo?.message) {
          this.exibirErro(corpo.message!, 'Buscar', `Usuários`);
        }
      },
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Buscar', `Usuários`);
      },
    });
  }

  protected adicionarSignatario(): void {
    this.ref.close(this.usuariosSignatario);
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
  }
}
