import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'top-cabecalho',
  templateUrl: './top-cabecalho.component.html',
})
export class TopCabecalhoComponent {
  @Input() botao = false;
  @Input() itens: string[] = [];
  @Input() recipiente?: string;
  @Input() entidade?: string;
  @Input() criar: () => void = () => {};

  constructor(protected router: Router) {}

  protected home() {
    this.router.navigate(['/processo/entrada']);
  }
}
