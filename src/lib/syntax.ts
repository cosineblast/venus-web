
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
    name: string
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
