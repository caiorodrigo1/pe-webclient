import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf_cnpj',
})
export class MascaraCpfCnpjPipe implements PipeTransform {
  static ɵfac: any;
  static ɵpipe: any;

  transform(palavra: any, args?: any): string {
    if (palavra.length === 11) {
      return palavra.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2}).*/,
        '$1.***.***-**'
      );
      //return palavra.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (palavra.length === 14) {
      return palavra.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
        '$1.$2.$3/$4-$5'
      );
    }
    return palavra;
  }
}
