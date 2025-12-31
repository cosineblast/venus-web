
import { type InputTree } from './syntax';
import * as nushell from './nushell';
import { match } from 'ts-pattern';

import { panic, type Result, ok, err, assert } from './util';

import * as z from 'zod';

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
    type: 'operator',
    name: nushell.Operator,
  } |
  {
    type: 'result'
  };

const UINodeSchema = z.intersection(
  z.object({
    id: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
  }),

  z.discriminatedUnion('type', [
    z.object({ type: z.literal('result'), data: z.object() }),
    z.object({
      type: z.literal('command'), data: z.object({
        label: z.string(),
        hasInput: z.boolean()
      })
    }),

    z.object({
      type: z.literal('data'), data: z.object({
        text: z.string(),
        literalType: nushell.AtomicLiteralTypeSchema,
      })
    }),

    z.object({
      type: z.literal('operator'), data: z.object({
        name: nushell.OperatorSchema
      })
    }),
  ])

  );

export type UINode = z.infer<typeof UINodeSchema>;

const UINodesSchema = z.array(UINodeSchema);

//  this type represents the directed graph of the nodes and edges drawn
//  by the user.
export class InputGraph {
  private constructor(
    private nodeInfo: Map<NodeId, InputNode>,

    // xyflow allows us to add a tag/handle to every edge.
    // we store this information as the string in here
    private sources: Map<NodeId, [NodeId, string | null][]>
  ) { }

  // TODO: add input validation
  static inputGraphFromUIGraph(uiNodes_: unknown, uiEdges: any): InputGraph {
    const uiNodes = UINodesSchema.parse(uiNodes_);
    
    const nodeInfo: Map<NodeId, InputNode> = new Map();
    const sources: Map<NodeId, [NodeId, string | null][]> = new Map();

    for (let uiNode of uiNodes) {
      const node = inputNodeFromUINode(uiNode);

      nodeInfo.set(uiNode.id, node);
      sources.set(uiNode.id, []);
    }

    for (let edge of uiEdges) {
      let src = edge.source;
      let target = edge.target;

      const handle = 'targetHandle' in edge ? edge.targetHandle : null;

      (sources.get(target) ?? panic('edge not ID not in node list')).push([src, handle]);
    }
    
    return new InputGraph(nodeInfo,  sources);
  }

  toInputTree(): Result<InputTree, string> {
    let resultSources = this.sources.get('result') ?? panic('result node not in graph');

    if (resultSources.length == 0) {
      return err('no node is linked to the result node');
    }

    if (resultSources.length > 1) {
      return err('too many nodes linked to result node');
    }

    let [rootID, _]  = resultSources[0];

    return ok(this.dfs(rootID));
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
          panic('command node is in DFS but has no sources');
        }

        const input = graphSources.length == 0 ? null : this.dfs(graphSources[0][0]);

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
      .with({type: 'operator'}, operator => {
        // TODO: refactor this
        // TODO: return error in case of invalid operator
        let graphSources = this.sources.get(root);

        if (!graphSources) {
          panic('root node has no sources');
        }
        if (graphSources.length < 2) {
          panic('operator node has less than 2 sources');
        }
        if (graphSources.length > 2) {
          panic('operator node has more than 2 sources');
        }

        const [[id1, handle1], [id2, handle2]] = graphSources;

        if (handle1 == null || handle2 == null) {
          panic('operator node has edge without handle');
        }

        // handles for operator are either 'A' or 'B'

        let leftId: NodeId;
        let rightId: NodeId;
        
        if (handle1 == 'A') {
          assert(handle2 == 'B', 'Inconsistent operator handles');

          leftId = id1;
          rightId = id2;
        } else {
          assert(handle2 == 'A', 'Inconsistent operator handles');
          assert(handle1 == 'B', 'Inconsistent operator handles');

          leftId = id2;
          rightId = id1;
        }

        return {
          type: 'operator',
          name: operator.name,
          left: this.dfs(leftId),
          right: this.dfs(rightId)
        }
      })
      .with({type: 'result'}, () => {
        panic('Unexpected result root command type')
      })
      .exhaustive()
  }
}


// Extracts the info of a UI (xyflow as of written) into a InputNode.
// throws if the data is invalid.
//
// TODO: use typebox or zod to validate input
function inputNodeFromUINode(uiNode: UINode): InputNode  {
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

  if (uiNode.type == 'operator') {
    return {
      type: 'operator',
      name: uiNode.data.name
    }
  }

  panic('unknown ui node type');
}

