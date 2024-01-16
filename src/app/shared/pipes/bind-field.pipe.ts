import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { format } from 'date-fns';
//import * as moment from 'moment';

@Pipe({
  name: 'bindField',
})
export class BindFieldPipe implements PipeTransform {
  html = '';
  valueString = '';

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, args?: any): any {
    if (typeof value !== 'undefined' && value !== null) {
      const formatosEspeciais: string[] = [
        'telefone',
        'cpf',
        'numeroProcesso',
        'statusSignatario',
        'documento',
      ];
      if (formatosEspeciais.includes(args['dataMap']))
        this.html = this.formatarDataMap(args['dataMap'], value);
      else this.html = this.formatarType(args['type'], value);

      return this.sanitizer.bypassSecurityTrustHtml(this.html);
    }

    return '';
  }

  private formatarType(type: string, value: any): any {
    let formatoRetornoTipo = '';
    switch (type) {
      case 'boolean': {
        break;
      }
      case 'weekday': {
        formatoRetornoTipo = value || '';
        break;
      }
      case 'date': {
        //formatoRetornoTipo = moment(value).format('DD/MM/YYYY');
        formatoRetornoTipo = format(new Date(value), 'dd/MM/yyyy');
        break;
      }
      case 'datetime': {
        //formatoRetornoTipo = moment(value).format('DD/MM/YYYY, HH:mm');
        formatoRetornoTipo = format(new Date(value), 'dd/MM/yyyy, HH:mm');
        break;
      }
      case 'time': {
        formatoRetornoTipo = value;
        //formatoRetornoTipo = this.formatDateWithTimeZone(value, 'HH:mm');
        break;
      }
      default: {
        formatoRetornoTipo = value.name || value;
        break;
      }
    }

    return formatoRetornoTipo;
  }

  private formatarDataMap(dataMap: string, value: any): any {
    let formatoRetornoDataMap = '';
    switch (dataMap) {
      case 'telefone': {
        formatoRetornoDataMap = this.formatPhone(value);
        break;
      }
      case 'cpf': {
        formatoRetornoDataMap = this.formatCPF(value);
        break;
      }
      case 'documento': {
        formatoRetornoDataMap = this.formatarCPF_CNPJ(value);
        break;
      }
      case 'numeroProcesso': {
        formatoRetornoDataMap = this.formatNumeroProcesso(value);
        break;
      }
      case 'statusSignatario': {
        formatoRetornoDataMap = this.formatStatusSignatario(value);
        break;
      }
      default: {
        formatoRetornoDataMap = value.name || value;
        break;
      }
    }

    return formatoRetornoDataMap;
  }

  private addInputCheckbox(value: boolean): string {
    return `<input type='checkbox' ${value ? 'checked' : ''} disabled />`;
  }

  private addSpanBoolean(value: boolean): string {
    return `<span style='color: ${
      value ? '#1D8348' : '#C0392B'
    }; font-weight: bold; text-align: center'>${this.valueString}</span>`;
  }

  private formatDate(value: string, format: string): any {
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(value, format);
  }

  // private formatDateWithTimeZone(value: string | any, format: string): any {
  //   if (value === undefined || value === null) return value;
  //   if (value instanceof moment)
  //     return moment(value).utcOffset(-3).format(format);
  //   value = value.includes('Z') ? value : `${value}Z`;
  //   return moment(value).format(format);
  // }

  private formatPhone(phone: string): any {
    return phone.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  }

  private formatCPF(cpf: string): string {
    //return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.***.***-**');
  }

  private formatCNPJ(cnpj: string): string {
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
      '$1.$2.$3/$4-$5'
    );
  }

  private formatarCPF_CNPJ(documento: string): string {
    if (documento.length === 11) {
      return this.formatCPF(documento);
    } else if (documento.length === 14) {
      return this.formatCNPJ(documento);
    }
    return documento;
  }

  private formatNumeroProcesso(numero: string): any {
    if (numero.length === 16) {
      return numero.replace(/^(\d{5})(\d{7})(\d{4}).*/, '$1.$2/$3');
    } else {
      return numero.replace(/^(\d{5})(\d{6})(\d{4}).*/, '$1.$2/$3');
    }
  }

  private formatStatusSignatario(status: string): any {
    let cor = '#000000';
    if (status === 'PENDENTE') {
      cor = '#0000FF';
    } else if (status === 'REJEITADO') {
      cor = '#FF0000';
    } else if (status === 'ASSINADO') {
      cor = '#008000';
    }
    return `<span style="color: ${cor}">${status}</span>`;
  }
}
