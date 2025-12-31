
import { match, P } from 'ts-pattern';

export type InputTree =
  {
    type: 'command',
    name: string,
    input: InputTree | null
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
  };

export namespace InputTree {
  export function toSyntaxTree(tree: InputTree): SyntaxTree {
    if (tree.input == null) {
      return {
        type: 'command',
        name: tree.name
      }
    } else {
      return {
        type: 'pipe',
        left: toSyntaxTree(tree.input),
        right: {
          type: 'command',
          name: tree.name
        }
      }
    }
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
      });
  }
}
