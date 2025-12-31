
export type Result<T, E> = {
  type: 'ok',
  value: T
} | {
  type: 'error',
  message: E
}

export function ok<T, E>(value: T): Result<T, E>  {
  return { type: 'ok', value }
}

export function err<T, E>(message: E): Result<T, E>  {
  return { type: 'error', message }
}

// utility function for throw an error as an expression
export function panic(message: string): never {
  throw new Error(message);
}
