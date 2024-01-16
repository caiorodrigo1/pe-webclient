import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

import { AutorizaService } from 'src/app/auth/services/autoriza.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { UsuarioLogadoService } from 'src/app/shared/services/usuario-logado.service';
import {
  IUsuarioLogado,
  UsuarioLogado,
} from 'src/app/shared/models/usuarioLogado.model';
import { ISetor } from 'src/app/shared/models/setor.model';

@Component({
  selector: 'top-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  @Input() usuario: IUsuarioLogado = new UsuarioLogado();
  @Output() alternarClicado = new EventEmitter();

  logoMarca: string = '/assets/img/layout/LogoTop-transparente.png'; // '/assets/img/logo-cliente.png';
  imagemUsuario = '/assets/img/user/usuario_anonimo.png';

  constructor(
    private autorizaService: AutorizaService,
    private storageService: StorageService,
    private usuarioLogadoService: UsuarioLogadoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //console.log('logado: ', this.usuario);
    //this.logoMarca = `data:image/png;base64,${this.usuario.logo}`;
  }

  protected trocarSetor(setor: ISetor) {
    this.storageService.gravarItem('session', 'setor', JSON.stringify(setor));
    this.usuario.setor = setor;
    this.usuarioLogadoService.escreverUsuarioLogado(this.usuario);
    const currentUrl = this.router.url;
    this.router.navigate([currentUrl]).then(() => {
      window.location.reload();
    });

    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //   this.router.navigateByUrl(currentUrl);
    //   console.log('foi');
    // });
  }

  protected logout(): void {
    this.autorizaService.desconectar$();
  }

  protected alternarMenu(): void {
    this.alternarClicado.emit();
  }
}
