
import { match } from 'ts-pattern';
import * as nushell from './nushell';
import { assert } from './util';

export type InputTree =
  {
    type: 'command',
    name: string,
    input: InputTree | null,
    parameters: [string, InputTree][],
    switches: string[]
  }  |
  {
    type: 'data',
    text: string,
    literalType: nushell.AtomicLiteralType
  }  |
  {
    type: 'operator',
    name: nushell.Operator,
    left: InputTree,
    right: InputTree
  }

export type SyntaxTree =
  {
    type: 'pipe',
    left: SyntaxTree,
    right: SyntaxTree
  } |
  {
    type: 'command',
    name: string,
    parameters: [string, SyntaxTree | null][]
  } |
  {
    type: 'literal',
    literalType: nushell.AtomicLiteralType,
    text: string
  } | {
    type: 'operator',
    name: nushell.Operator,
    left: SyntaxTree,
    right: SyntaxTree
  };

export namespace InputTree {
  export function toSyntaxTree(tree: InputTree): SyntaxTree {
    return match(tree)
      .returnType<SyntaxTree>()
      .with({ type: 'command' }, (command): SyntaxTree => {
        const params: [string,  SyntaxTree | null][] = command.parameters
            .map(param => [param[0], toSyntaxTree(param[1])] as const);

        const switches: [string,  SyntaxTree | null][] =
          command.switches.map(it => [it, null]);

        const cmd: SyntaxTree = {
          type: 'command',
          name: command.name,
          parameters: params.concat(switches),
        }

        if (command.input == null) {
          return cmd;
        } else {
          return {
            type: 'pipe',
            left: toSyntaxTree(command.input),
            right: cmd
          }
        }
      })
      .with({type: 'data'}, data => ({
          type: 'literal',
          literalType: data.literalType,
          text: data.text
        })
      )
      .with({type: 'operator'}, operator => ({
          type: 'operator',
          name: operator.name,
          left: toSyntaxTree(operator.left),
          right: toSyntaxTree(operator.right)
        })
      )
      .exhaustive();

  }
}

export namespace SyntaxTree {

  export function toNushellSource(tree: SyntaxTree): string {
    const result: string[] = [];
    render(tree, result);
    return result.join('');
  }
  // TODO: add .. support
  // .. is not exactly an operator, but it works
  // quite like one, except for one syntatical difference:
  // it must NOT have space before its arguments,
  // so `1 .. 3` is not valid, but `1..3` is.
  function render(tree: SyntaxTree, output: string[]) {
    match(tree)
      .with({ type: 'command' }, command => {
        output.push(command.name);

        for (const [name, value] of command.parameters) {
          if (name == '...rest') {
            output.push(' ...')

            if (value != null) {
              output.push('(');
              render(value, output);
              output.push(')');
            }
          } else if (name.startsWith('--')) {
            let flagName = extractFlagName(name);
            output.push(' --')

            if (flagName != null) {
              output.push(flagName)
            }

            if (value != null) {
              output.push('=(');
              render(value, output);
              output.push(')');
            }
          } else if (value != null) {
            output.push(' (')
            render(value, output);
            output.push(')');
          }
        }
      })
      .with({ type: 'pipe'}, pipe => {

        output.push('(');
        render(pipe.left, output);
        output.push(')');

        output.push('|');

        output.push('(');
        render(pipe.right, output);
        output.push(')');
      })
      .with({ type: 'literal'}, literal => {
        // TODO: fail if text is invalid
        output.push(literal.text);
      })
      .with({ type: 'operator'}, operator => {
        output.push('(');
        render(operator.left, output);
        output.push(') ');
        output.push(operator.name)
        output.push(' (');
        render(operator.right, output);
        output.push(')');
      })
      .exhaustive();
  }
}

// nushell returns flag names of the form `--help(-h)`, so we
// use this function to extract the `-h`.
function extractFlagName(fullFlagName: string): string | null {
  const match = fullFlagName.match(/^-*([a-z0-9]+)/i);
  return match ? match[1] : null;
  
}
