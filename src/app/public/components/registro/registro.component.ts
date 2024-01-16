import { Component, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IEntidade } from 'src/app/shared/models/entidade-response.model';
import { IUsuario, Usuario } from '../../../shared/models/usuario.model';
import { UsuarioService } from 'src/app/entities/crudsso/usuario/usuario.service';
import { ExibirMensagemService } from 'src/app/shared/services/exibir-mensagem.service';

@Component({
  selector: 'registro',
  templateUrl: './registro.component.html',
})
export class RegistroComponent {
  // usuario?: IUsuario;
  // recipiente!: string;
  // salvando = false;
  // editForm = this.fb.group({
  //   id: [0],
  //   nome: [
  //     '',
  //     [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
  //   ],
  //   sobrenome: [
  //     '',
  //     [Validators.required, Validators.minLength(2), Validators.maxLength(48)],
  //   ],
  //   cpf: ['', [Validators.required, CpfCnpjValidator.validate]],
  //   email: [
  //     '',
  //     [
  //       Validators.required,
  //       Validators.pattern(
  //         /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  //       ),
  //     ],
  //   ],
  //   emailConfirmar: [
  //     '',
  //     [
  //       Validators.required,
  //       Validators.pattern(
  //         /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  //       ),
  //     ],
  //   ],
  //   senha: ['', [Validators.required, Validators.minLength(6)]],
  // });
  // constructor(
  //   private fb: FormBuilder,
  //   private renderer: Renderer2,
  //   protected usuarioService: UsuarioService,
  //   private exibirMensagemService: ExibirMensagemService
  // ) {
  //   this.renderer.addClass(document.body, 'bg-white');
  // }
  // ngOnInit(): void {}
  // ngOnDestroy() {
  //   this.renderer.removeClass(document.body, 'bg-white');
  // }
  // salvar(): void {
  //   if (this.editForm.valid) {
  //     this.salvando = true;
  //     const usuario = this.criarFormulario();
  //     this.subscribeParaSalvarResposta(
  //       this.usuarioService.registrarUsuario(usuario)
  //     );
  //   }
  // }
  // private criarFormulario(): IUsuario {
  //   return {
  //     ...new Usuario(),
  //     nome: `${this.editForm.get(['nome'])!.value} ${
  //       this.editForm.get(['sobrenome'])!.value
  //     }`,
  //     // cpf: this.editForm.get(['cpf'])!.value,
  //     // email: this.editForm.get(['email'])!.value,
  //     // senha: this.editForm.get(['senha'])!.value,
  //   };
  // }
  // protected subscribeParaSalvarResposta(
  //   resultado: Observable<HttpResponse<IEntidade>>
  // ): void {
  //   resultado.subscribe({
  //     complete: () => this.aoSalvarComSucesso(),
  //     error: () => this.erroAoSalvar(),
  //   });
  // }
  // protected aoSalvarComSucesso(): void {
  //   this.salvando = false;
  //   this.exibirMensagem('success', ['Usuário registrado com sucesso.']);
  // }
  // protected erroAoSalvar(): void {
  //   this.salvando = false;
  //   this.exibirMensagem('error', ['Error ao realizar o registro.']);
  // }
  // private exibirMensagem(tipo: string, mensagem: string[]): void {
  //   this.exibirMensagemService.mensagem(
  //     tipo,
  //     'Serviço de Mensagem',
  //     mensagem,
  //     'registro-form'
  //   );
  // }
}
