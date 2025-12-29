
import { match } from 'ts-pattern'
import * as wasm_wrapper from '../nu/venus_wrapper'
import * as z from 'zod';

export type Result = {
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


const Command = z.object({
  name: z.string(),
  category: z.string(),
  command_type: z.string(),
  description: z.string(),
  params: z.unknown(),
  input_output: z.unknown(),
  search_terms: z.string(),
});

const CommandList = z.array(Command);


export type Command = z.infer<typeof Command>;
export type CommandList = z.infer<typeof CommandList>;

export async function getNushellCommands(): Promise<CommandList> {

  const result = await executeNushell('help commands | where command_type == built-in | where category != core | where category != "debug"');

  if (result.type == 'ok') {
    return CommandList.parse(result.result);
  } else {
    // TODO: return UI error message in this case
    console.log('crap...');
  }

  
  const response = await fetch('/nu_commands.json')
  return CommandList.parse(await response.json())
}

export function commandMatches(command: Command, filter: string): boolean {
  return filter == '' || command.name.includes(filter) || command.category.includes(filter);
}
