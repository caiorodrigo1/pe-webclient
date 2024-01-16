import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';

import { PermissaoService } from '../../permissao.service';
import { OrgaoService } from 'src/app/shared/services/orgao.service';
import { PapeisUsuarioService } from '../../../papeis-usuario/papeis-usuario.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';
import { CodigosErro } from 'src/app/shared/enums/codigos-erro.enum';
import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { ISetor, Setor } from 'src/app/shared/models/setor.model';
import {
  IPapeisUsuario,
  PapeisUsuario,
} from 'src/app/shared/models/papeis-usuario.model';
import { IUsuario, Usuario } from 'src/app/shared/models/usuario.model';
import { IOrgao, Orgao } from 'src/app/shared/models/orgao.model';
import { IUsuarioLogado } from 'src/app/shared/models/usuarioLogado.model';
import { IPermissao, Permissao } from 'src/app/shared/models/permissao.model';

@Component({
  selector: 'top-permissao-atualizar',
  templateUrl: './permissao-atualizar.component.html',
})
export class PermissaoAtualizarComponent implements OnInit, OnDestroy {
  recipiente: string = 'Permissão';
  acao: string = 'Criar';
  permissao?: IPermissao;
  usuarioLogado!: IUsuarioLogado;

  orgaos: IOrgao[] = [];
  setores: ISetor[] = [];
  usuarios: IUsuario[] = [];
  papeisUsuarios: IPapeisUsuario[] = [];

  inscricaoConsulta!: Subscription;
  inscricaoServico!: Subscription;
  inscricaoPapeis!: Subscription;
  inscricaoSetores!: Subscription;
  inscricaoUsuarios!: Subscription;
  inscricaoOrgaos!: Subscription;
  inscricaoUsuarioLogado!: Subscription;

  carregando: boolean = true;
  salvando: boolean = false;

  editForm = this.fb.group({
    id: [this.permissao?.id],
    usuario: [new Usuario()],
    orgao: [new Orgao()],
    setor: [{ value: new Setor(), disabled: true }],
    papel: [new PapeisUsuario(), Validators.required],
    usuarioCoordenador: [true, Validators.required],
    ativo: [true, Validators.required],
  });

  constructor(
    private permissaoService: PermissaoService,
    private orgaoService: OrgaoService,
    private papeisUsuarioService: PapeisUsuarioService,
    private usuarioLogadoService: UsuarioLogadoService,
    private storageService: StorageService,
    private exibirMensagemService: ExibirMensagemService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buscarOrigens();
    this.buscarRota();
  }

  ngOnDestroy(): void {
    if (this.inscricaoOrgaos) this.inscricaoOrgaos.unsubscribe();
    if (this.inscricaoSetores) this.inscricaoSetores.unsubscribe();
    if (this.inscricaoUsuarios) this.inscricaoUsuarios.unsubscribe();
    if (this.inscricaoPapeis) this.inscricaoPapeis.unsubscribe();
    if (this.inscricaoConsulta) this.inscricaoConsulta.unsubscribe();
    if (this.inscricaoServico) this.inscricaoServico.unsubscribe();
    if (this.inscricaoUsuarioLogado) this.inscricaoUsuarioLogado.unsubscribe();
  }

  private buscarOrigens(): void {
    this.inscricaoUsuarioLogado = this.usuarioLogadoService
      .consultarUsuarioLogado()
      .subscribe((resposta) => {
        this.usuarioLogado = resposta;
      });
  }

  private buscarRota(): void {
    this.activatedRoute.paramMap.subscribe((valor) => {
      const id = valor.get('id');
      if (id) {
        this.acao = 'Editar';
        this.consultarPermissao$(Number(id));
      } else {
        this.ajustarDropdowns();
        this.carregando = false;
      }
    });
  }

  private ajustarDropdowns(): void {
    this.carregarOrgaos$();
    this.carregarUsuarios$();
    this.carregarPapeisUsuario$(false);
    this.editForm.get('orgao')!.setValidators([Validators.required]);
    this.editForm.get('setor')!.setValidators([Validators.required]);
    this.editForm.get('usuario')!.setValidators([Validators.required]);
    this.editForm.get('orgao')!.setValue(null);
    this.editForm.get('setor')!.setValue(null);
    this.editForm.get('usuario')!.setValue(null);
    this.editForm.get('papel')!.setValue(null);
  }

  private consultarPermissao$(id: number): void {
    this.inscricaoConsulta = this.permissaoService
      .consultarPermissao(id)
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.permissao = corpo!.data;
          this.carregarPapeisUsuario$(true);
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', this.recipiente);
        },
      });
  }

  private carregarPapeisUsuario$(id: boolean): void {
    this.inscricaoPapeis = this.papeisUsuarioService
      .consultarPapeisUsuarios()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.papeisUsuarios = corpo!.data || [];
          if (id) this.atualizarFormulario();
        },
        error: (resposta: HttpErrorResponse) => {
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Papéis do Usuário');
        },
      });
  }

  private atualizarFormulario(): void {
    this.editForm.patchValue({
      id: this.permissao?.id,
      usuario: { id: this.permissao?.usuarioId },
      setor: { id: this.permissao?.setorId },
      papel: { id: this.permissao?.papelId },
      usuarioCoordenador: this.permissao
        ? this.permissao?.usuarioCoordenador
        : true,
      ativo: this.permissao ? this.permissao?.ativo : true,
    });
    this.carregando = false;
    this.editForm.markAllAsTouched();
  }

  private carregarUsuarios$(): void {
    this.inscricaoUsuarios = this.permissaoService
      .consultarListaUsuariosPE()
      .subscribe({
        next: (resposta: HttpResponse<IEntidade>) => {
          const corpo = resposta.body;
          this.usuarios = corpo!.data || [];
        },
        error: (resposta: HttpErrorResponse) => {
          this.usuarios = [];
          const erro: IEntidade = resposta.error;
          this.exibirErro(erro.message!, 'Buscar', 'Usuários');
        },
      });
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

  protected cancelar(): void {
    this.router.navigate(['permissao']);
  }

  protected salvar(): void {
    if (this.editForm.valid) {
      this.salvando = true;

      const permissao = this.criarFormulario();

      if (permissao.id === undefined) {
        this.chamarServico(
          this.permissaoService.incluirPermissao(permissao),
          'criada'
        );
      } else {
        this.chamarServico(
          this.permissaoService.atualizarPermissao(permissao),
          'atualizada'
        );
      }
    }
  }

  private criarFormulario(): IPermissao {
    return {
      ...new Permissao(),
      id: this.editForm.get(['id'])!.value || undefined,
      orgao: this.editForm.get(['orgao'])!.value,
      usuarioId: this.editForm.get(['usuario'])!.value.id,
      setorId: this.editForm.get(['setor'])!.value.id,
      papelId: this.editForm.get(['papel'])!.value.id,
      usuarioCoordenador: this.editForm.get(['usuarioCoordenador'])!.value,
      ativo: this.editForm.get(['ativo'])!.value,
    };
  }

  private chamarServico(
    resultado: Observable<HttpResponse<IEntidade>>,
    acao: string
  ): void {
    this.inscricaoServico = resultado.subscribe({
      complete: () => this.seguir_sucesso(acao),
      error: (resposta: HttpErrorResponse) => {
        const erro: IEntidade = resposta.error;
        this.exibirErro(erro.message!, 'Salvar', this.recipiente);
      },
    });
  }

  private seguir_sucesso(acao: string): void {
    this.exibirMensagemService.mensagem('success', 'Serviço de Mensagem', [
      `${this.recipiente} ${acao} com sucesso.`,
    ]);
    //EventBus.getInstance().dispatch<any>('mudancaListaPermissao');
    this.salvando = false;
    this.cancelar();
    this.inserirSetorTempoReal();
  }

  private inserirSetorTempoReal() {
    const identificadorUsuario: string = this.editForm.get(['usuario'])!.value
      .identificador;
    const identificador: string = this.editForm.get(['orgao'])!.value
      .identificador;

    if (
      this.usuarioLogado.identificadorUsuario === identificadorUsuario &&
      this.usuarioLogado.orgao?.identificador === identificador
    ) {
      const setor: ISetor = {
        id: this.editForm.get(['setor'])!.value.id,
        sigla: this.editForm.get(['setor'])!.value.sigla,
        identificadorOrgao: identificador,
      };

      this.usuarioLogado.setores?.push(setor);

      const setoresString = JSON.stringify(this.usuarioLogado.setores);
      this.storageService.gravarItem('session', 'setores', setoresString);
    }
  }

  private exibirErro(codigo: string, acao: string, nome: string): void {
    let erro = (CodigosErro as Record<string, string>)[codigo];
    if (erro === undefined) erro = `Erro ao ${acao} ${nome}`;
    this.exibirMensagemService.mensagem('error', 'Serviço de Mensagem', [erro]);
    this.salvando = false;
  }
}
