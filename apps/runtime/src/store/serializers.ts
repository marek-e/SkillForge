export function serializeJsonField(value: unknown): string {
  return JSON.stringify(value)
}

export function deserializeJsonField<T>(value: string | null, defaultValue?: T): T | undefined {
  if (value === null) return defaultValue
  return JSON.parse(value) as T
}

export function serializeNullableJsonField(value: unknown | undefined): string | null {
  return value === undefined ? null : JSON.stringify(value)
}
