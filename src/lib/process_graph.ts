
type Node =
  {
    type: 'command',
    command: string
  } |
  {
    type: 'result'
  };

interface ExpressionGraph {
  node_by_id: Map<string, Node>,
  targets: Map<string, [string]>,
}

function fromUIGraph(nodes: any, edges: any): ExpressionGraph {

  const targets: Map<string, [string]> = new Map();

  for node of nodes {
    targets.set(nodes.id, []);
  }

  for edge of edges {
    let src = edge.source;
    let target = edge.target;


  }

  return {
    edge_map: nodes
  }

  
   
}

