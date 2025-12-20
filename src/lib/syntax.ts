
export type CommandTree =
  {
    type: 'command',
    name: string,
    input: CommandTree | null
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

export namespace CommandTree {
  export function toSyntaxTree(tree: CommandTree): SyntaxTree {
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
