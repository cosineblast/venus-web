
import { match } from 'ts-pattern'
import * as wasm_wrapper from '../nu/venus_wrapper'
import * as z from 'zod';

export type Result = {
  type: 'ok',
  value: any,
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

const NushellResultSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('success'), value_json: z.string() }),
  z.object({ type: z.literal('failure'), error_json: z.string() }),
  z.object({ type: z.literal('serialize_failure')})
]);

const NushellErrorSchema  = z.object({
  msg: z.string(),
  debug: z.string(),
  rendered: z.string(),
});
 
export async function executeNushell(source: string): Promise<Result> {
  await wasm_wrapper.default();

  // TODO: use zod
  const result: RawNushellResult = NushellResultSchema.parse(wasm_wrapper.execute(source));

  return match(result)
    .with({ type: 'serialize_failure' }, () => ({ type: 'error' as const, message: 'Computation succeeded, but the result value cannot be displayed :/'}))
    .with({ type: 'failure'}, err => {

      const errorValue = NushellErrorSchema.parse(JSON.parse(err.error_json));

      console.log('nushell error:', errorValue);

      return { type: 'error' as const, message:
        `Error: ${errorValue.msg}\n${errorValue.rendered}`
      }
    })
    .with({ type: 'success'}, result => ({type: 'ok' as const, value: JSON.parse(result.value_json)}))
    .exhaustive()
}


const CommandSchema = z.object({
  name: z.string(),
  category: z.string(),
  command_type: z.string(),
  description: z.string(),
  params: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string(),
  })),
  input_output: z.array(z.object({
    input: z.string(),
    output: z.string()
  })),
  search_terms: z.string(),
});
export type Command = z.infer<typeof CommandSchema>;

const CommandListSchema = z.array(CommandSchema);

export type CommandList = z.infer<typeof CommandListSchema>;

export async function getNushellCommands(): Promise<CommandList> {

  const result = await executeNushell('help commands | where command_type == built-in | where category != core | where category != "debug"');

  if (result.type == 'ok') {
    return CommandListSchema.parse(result.value);
  } else {
    // TODO: return UI error message in this case
    console.log('crap...');
  }

  
  const response = await fetch('/nu_commands.json')
  return CommandListSchema.parse(await response.json())
}

export namespace Command {
  export function matchesFilter(command: Command, filter: string): boolean {
    return filter == '' || command.name.includes(filter) || command.category.includes(filter);
  }

  export function hasInput(command: Command): boolean {
    if (command.input_output.length == 0) {
      return false;
    }

    return command.input_output.some(signature => signature.input != 'nothing')
  }
}

export const AtomicLiteralTypeSchema =  z.enum(['int', 'float', 'string', 'duration', 'filesize', 'boolean', 'datetime'])
export type AtomicLiteralType = z.infer<typeof AtomicLiteralTypeSchema>;

export async function literalIsOk(literal: string, literalType: AtomicLiteralType): Promise<boolean> {
  await wasm_wrapper.default().then();

  return wasm_wrapper.is_valid_literal(literal, literalType);
  //return false;
}

export const OperatorSchema = z.enum(["+"
  , "-"
  , "*"
  , "/"
  , "//"
  , "mod"
  , "**"
  , "=="
  , "!="
  , "<"
  , "<="
  , ">"
  , ">="
  , "=~"
  , "!~"
  , "in"
  , "not-in"
  , "has"
  , "not-has"
  // , "not"
  , "and"
  , "or"
  , "xor"
  , "bit-or"
  , "bit-xor"
  , "bit-and"
  , "bit-shl"
  , "bit-shr"
  , "starts-with"
  , "ends-with"
  , "++"]);

export type Operator = z.infer<typeof OperatorSchema>;
