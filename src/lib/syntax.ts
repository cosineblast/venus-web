
import { match, P } from 'ts-pattern';
import * as nushell from './nushell';

export type InputTree =
  {
    type: 'command',
    name: string,
    input: InputTree | null
  }  |
  {
    type: 'data',
    text: string,
    literalType: nushell.AtomicLiteralType
  }  

export type SyntaxTree =
  {
    type: 'pipe',
    left: SyntaxTree,
    right: SyntaxTree
  } |
  {
    type: 'command',
    name: string
  } |
  {
    type: 'literal',
    literalType: nushell.AtomicLiteralType,
    text: string
  };

export namespace InputTree {
  export function toSyntaxTree(tree: InputTree): SyntaxTree {
    return match(tree)
      .returnType<SyntaxTree>()
      .with({ type: 'command' }, command => {
        if (command.input == null) {
          return {
            type: 'command',
            name: command.name
          }
        } else {
          return {
            type: 'pipe',
            left: toSyntaxTree(command.input),
            right: {
              type: 'command',
              name: command.name
            }
          }
        }
      })
      .with({type: 'data'}, data => ({
          type: 'literal',
          literalType: data.literalType,
          text: data.text
        })
      ).exhaustive();

  }
}

export namespace SyntaxTree {

  export function toNushellSource(tree: SyntaxTree): string {
    const result: string[] = [];
    render(tree, result);
    return result.join('');
  }

  function render(tree: SyntaxTree, output: string[]) {
    match(tree)
      .with({ type: 'command'}, command => { output.push(command.name); })
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
      .exhaustive();
  }
}
