import { Component } from '@angular/core';

@Component({
  selector: 'top-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  versao: string = ' 1.0';
  logo: string = '/assets/img/logo/LogoTop.png';
  descricao: string = 'Logo da Top Solutions';
  ano: string = '2023';
}
