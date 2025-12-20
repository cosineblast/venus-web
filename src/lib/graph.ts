
import { type CommandTree } from './syntax';


type NodeId = string;

type CommandNode =
  {
    type: 'command',
    name: string
  } |
  {
    type: 'result'
  };

export class CommandGraph {
  constructor(
    private nodeInfo: Map<NodeId, CommandNode>,
    private sources: Map<NodeId, NodeId[]>
  ) { }

  static commandGraphFromUIGraph(uiNodes: any, uiEdges: any): CommandGraph | null {
    const nodeInfo: Map<NodeId, CommandNode> = new Map();
    const targets: Map<NodeId, NodeId[]> = new Map();
    const sources: Map<NodeId, NodeId[]> = new Map();

    for (let uiNode of uiNodes) {
      const node =  commandNodeFromUINode(uiNode);

      if (node == null) {
        return null;
      }

      nodeInfo.set(uiNode.id, node);
      targets.set(uiNode.id, []);
      sources.set(uiNode.id, []);
    }

    for (let edge of uiEdges) {
      let src = edge.source;
      let target = edge.target;

      (targets.get(src) ?? panic('edge node ID not in node list')).push(target);
      (sources.get(target) ?? panic('edge not ID not in node list')).push(src);
    }
    
    return new CommandGraph(nodeInfo,  sources);
  }

  toCommandTree(): CommandTree {
    let resultSources = this.sources.get('result') ?? panic('result node not in graph');

    if (resultSources.length == 0) {
      // TODO: make this error part of the API
      panic('no node is linked to the result node');
    }

    if (resultSources.length > 1) {
      panic('too many nodes linked to result node');
    }

    let rootID = resultSources[0];

    return this.dfs(rootID);
  }
  
  // creates a CommandTree out of a section of a graph, starting at 'root'.
  // assumes root is in the graph and is a command node
  private dfs(root: NodeId): CommandTree {
    const node = this.nodeInfo.get(root) ?? panic('root not is not in graph!');

    if (node.type != 'command') {
      panic('root node is not a command node');
    }

    // for now, commands can only have one input, the pipe input
    let graphSources = this.sources.get(root);

    if (!graphSources) {
      panic('root node has no sources');
    }

    let input: CommandTree | null = null;

    if (graphSources.length != 0) {
      input = this.dfs(graphSources[0]);
    }

    return {
      type: 'command',
      name: node.name,
      input
     }
  }
}


// Extracts the info of a UI (xyflow as of written) into a CommandNode.
// throws if the data is invalid.
//
// TODO: use typebox or zod to validate input
function commandNodeFromUINode(uiNode: any): CommandNode  {
  if (uiNode.id == 'result' || uiNode.type == 'result') {
    return { type: 'result' }
  }

  if (uiNode.type == 'command') {
    return {
      type: 'command',
      name: uiNode.data.label
    }
  }

  panic('unknown command type');
}

// utility function for throw an error as an expression
function panic(message: string): never {
  throw new Error(message);
}
