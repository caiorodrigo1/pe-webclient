import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mesSigla',
})
export class MesPipe implements PipeTransform {
  static ɵfac: any;
  static ɵpipe: any;

  transform(mesNumero: number, args?: any): any {
    const meses: { [key: number]: string } = {
      1: 'Jan',
      2: 'Fev',
      3: 'Mar',
      4: 'Abr',
      5: 'Mai',
      6: 'Jun',
      7: 'Jul',
      8: 'Ago',
      9: 'Set',
      10: 'Out',
      11: 'Nov',
      12: 'Dez',
    };

    return meses[mesNumero];
  }
}
