import { ValueTransformer } from 'typeorm';

/**
 * Keeps numeric/decimal columns as JS `number` in the application layer.
 * Postgres `numeric` is read back as a string by the pg driver; this parses it.
 */
export class ColumnNumericTransformer implements ValueTransformer {
  to(value?: number | null): number | null | undefined {
    return value;
  }

  from(value?: string | null): number | null | undefined {
    if (value === null || value === undefined) {
      return value as null | undefined;
    }
    return parseFloat(value);
  }
}
