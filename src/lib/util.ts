
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

export function assert(condition: boolean, message: string | (() => string)): void {
  if (condition) {
    return;
  }

  let userMessage = typeof message == 'string' ? message : message();

  panic(`assertion failed: ${userMessage}`)
}
