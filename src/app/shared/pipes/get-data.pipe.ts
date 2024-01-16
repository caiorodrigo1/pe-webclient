import { Pipe, PipeTransform } from '@angular/core';
import { accessDataInObjects } from '../util/access-data-objects';

@Pipe({
  name: 'getData',
})
export class GetDataPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (args.length === 0) return value;
    const propertyNames = args[0].split('.');
    return accessDataInObjects(value, propertyNames);
  }
}
