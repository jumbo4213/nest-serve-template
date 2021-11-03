import { Transform, TransformOptions } from 'class-transformer';

export function TransformToNumber(options?: TransformOptions) {
  return Transform(
    (value: any) => {
      value = +value;
      return isNaN(value) || value === Infinity ? undefined : value;
    },
    { toClassOnly: true, ...options },
  );
}

/**
 * transform string to number
 *
 * undefined, '' -> undefined
 * null -> null
 * 'false', '0', 'ff' !value -> false
 * other -> true
 *
 */
export function TransformToBoolean(options?: TransformOptions) {
  return Transform(
    (value: any) => {
      //empty
      if (value === '') return undefined;
      if (value === undefined || value === null) return value;

      return !(value === 'false' || value === '0' || value === 'off' || !value);
    },
    {
      toClassOnly: true,
      ...options,
    },
  );
}

/**
 * Transform number round
 *
 * @param digit
 * @param options
 */
export function TransformNumberRound(digit = 2, options?: TransformOptions) {
  return Transform(
    (value: any) => {
      return Math.round(value * Math.pow(10, digit)) / Math.pow(10, digit);
    },
    { toPlainOnly: true, ...options },
  );
}
