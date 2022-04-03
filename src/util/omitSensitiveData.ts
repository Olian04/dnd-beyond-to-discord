const sensitiveData = { hookURL: null, };

type SensitiveData = {
  [k in keyof typeof sensitiveData]: any;
}

export const omitSensitiveData = <T extends Partial<SensitiveData>, R extends Omit<T, keyof SensitiveData>>(obj: T): R => Object.keys(obj)
  .filter(k => !(k in sensitiveData))
  .reduce((res, k) => ({...res, [k]: obj[k]}), {} as R);