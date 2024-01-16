export const accessDataInObjects = function accessData(
  value: string,
  propertyNames: string[]
): string {
  if (propertyNames.length > 0) {
    const property: any = propertyNames.shift() || '';
    const newValue = value[property];
    if (newValue === undefined || newValue === null) return newValue;
    return accessData(newValue, propertyNames);
  }

  return value;
};
