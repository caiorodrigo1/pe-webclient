import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroProcesso',
})
export class NumeroProcessoPipe implements PipeTransform {
  static ɵfac: any;
  static ɵpipe: any;

  transform(palavra: any, args?: any): any {
    if (!palavra) return 'Número Inexistente';

    if (palavra.length === 16) {
      return palavra.replace(/^(\d{5})(\d{7})(\d{4}).*/, '$1.$2/$3');
    } else {
      return palavra.replace(/^(\d{5})(\d{6})(\d{4}).*/, '$1.$2/$3');
    }
  }
}
