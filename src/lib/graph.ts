
import { type InputTree } from './syntax';
import * as nushell from './nushell';
import { match } from 'ts-pattern';

type NodeId = string;

type InputNode =
  {
    type: 'command',
    name: string
  } |
  {
    type: 'data',
    text: string,
    literalType: nushell.AtomicLiteralType,
  } |
  {
    type: 'result'
  };

//  this type represents the directed graph of the nodes and edges drawn
//  by the user.
export class InputGraph {
  private constructor(
    private nodeInfo: Map<NodeId, InputNode>,
    private sources: Map<NodeId, NodeId[]>
  ) { }

  // TODO: add input validation
  static inputGraphFromUIGraph(uiNodes: any, uiEdges: any): InputGraph {
    const nodeInfo: Map<NodeId, InputNode> = new Map();
    const targets: Map<NodeId, NodeId[]> = new Map();
    const sources: Map<NodeId, NodeId[]> = new Map();

    for (let uiNode of uiNodes) {
      const node = inputNodeFromUINode(uiNode);

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
    
    return new InputGraph(nodeInfo,  sources);
  }

  toInputTree(): InputTree | { type: 'error', message: string } {
    let resultSources = this.sources.get('result') ?? panic('result node not in graph');

    if (resultSources.length == 0) {
      return { type: 'error', message: 'no node is linked to the result node'};
    }

    if (resultSources.length > 1) {
      return { type: 'error', message: 'too many nodes linked to result node'};
    }

    let rootID = resultSources[0];

    return this.dfs(rootID);
  }
  
  // creates a InputTree out of a section of a graph, starting at 'root'.
  // assumes root is in the graph and is a command node
  private dfs(root: NodeId): InputTree {
    const node = this.nodeInfo.get(root) ?? panic('root not is not in graph!');

    return match(node)
      .returnType<InputTree>()
      .with({ type: 'command' }, command => {
        // for now, commands can only have one input, the pipe input
        let graphSources = this.sources.get(root);

        if (!graphSources) {
          panic('root node has no sources');
        }

        const input = graphSources.length == 0 ? null : this.dfs(graphSources[0]);

        return {
          type: 'command',
          name: command.name,
          input
        }
      })
      .with({ type: 'data' }, data => ({
        type: 'data',
        text: data.text,
        literalType: data.literalType
      })
      )
      .otherwise(() => {
        panic('Unexpected root command type')
      })
  }
}


// Extracts the info of a UI (xyflow as of written) into a InputNode.
// throws if the data is invalid.
//
// TODO: use typebox or zod to validate input
function inputNodeFromUINode(uiNode: any): InputNode  {
  if (uiNode.id == 'result' || uiNode.type == 'result') {
    return { type: 'result' }
  }

  if (uiNode.type == 'command') {
    return {
      type: 'command',
      name: uiNode.data.label
    }
  }

  if (uiNode.type == 'data') {
    return {
      type: 'data',
      literalType: uiNode.data.literalType,
      text:uiNode.data.text
    }
  }

  panic('unknown ui node type');
}

// utility function for throw an error as an expression
function panic(message: string): never {
  throw new Error(message);
}
