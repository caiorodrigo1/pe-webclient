import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IUsuarioLogado } from '../models/usuarioLogado.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioLogadoService {
  usuarioLogado: IUsuarioLogado = {
    id: 0,
    nome: 'indefinido',
    cliente: 'indefinido',
    identificadorCliente: 'indefinido',
    identificadorUsuario: 'indefinido',
    clienteId: 0,
    setor: {
      id: 0,
      sigla: 'indefinido',
      identificadorOrgao: 'indefinido',
    },
    setores: [],
  };

  private usuarioLogadoBehavior = new BehaviorSubject<IUsuarioLogado>(
    this.usuarioLogado
  );

  constructor() {}

  public consultarUsuarioLogado(): BehaviorSubject<IUsuarioLogado> {
    return this.usuarioLogadoBehavior;
  }

  public escreverUsuarioLogado(usuarioLogado: IUsuarioLogado): void {
    this.usuarioLogadoBehavior.next(usuarioLogado);
  }
}
