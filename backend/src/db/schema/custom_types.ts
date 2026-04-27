import { customType } from 'drizzle-orm/pg-core';

export const geography = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'geography';
  },
  toDriver(value: string): string {
    return value;
  },
  fromDriver(value: string): string {
    return value;
  },
});
