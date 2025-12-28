
type Result = {
  type: 'ok',
  result: any,
} | {
  type: 'error',
  message: string
}

type RawNushellResult = {
  type: 'success',
  value_json: string,
} | {
  type: 'failure',
  error_json: string
} | {
  type: 'serialize_failure'
}


 
import { match } from 'ts-pattern'
import * as wasm_wrapper from '../nu/venus_wrapper'


export async function executeNushell(source: string): Promise<Result> {
  await wasm_wrapper.default().then();

  // TODO: use zod
  const result: RawNushellResult = wasm_wrapper.execute(source);

  return match(result)
    .with({ type: 'serialize_failure' }, () => ({ type: 'error' as const, message: 'Computation succeeded, but the result value cannot be displayed :/'}))
    .with({ type: 'failure'}, err => ({ type: 'error' as const, message: err.error_json }))
    .with({ type: 'success'}, result => ({type: 'ok' as const, result: JSON.parse(result.value_json)}))
    .exhaustive()
}
