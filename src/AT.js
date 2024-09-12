export const algorithmState = {
  openList: [],
  closeList: [],
  path: [],
  currentStep: 0,
  intervalId: null,
  nodeMap: new Map(),
  resolved: false,
};

export async function AT(nodes, onStepUpdate) {
  const startNodeLabel = document.getElementById("startNodeInput").value;
  const goalNodeLabels = document
    .getElementById("goalNodeInput")
    .value.split(",");

  if (startNodeLabel && goalNodeLabels.length > 0) {
    const startNode = nodes.find((node) => startNodeLabel === node.label);
    const goalNodes = goalNodeLabels
      .map((label) => nodes.find((node) => label.trim() === node.label))
      .filter(Boolean);

    if (startNode && goalNodes.length > 0) {
      algorithmState.openList = [startNode];
      algorithmState.closeList = [];
      algorithmState.path = [];
      algorithmState.currentStep = 0;
      algorithmState.resolved = false;

      startNode.g = 0;
      startNode.parent = null;

      algorithmState.nodeMap.clear();
      algorithmState.nodeMap.set(startNode, {
        g: 0,
        parent: null,
      });

      algorithmState.intervalId = setInterval(
        () => step(nodes, goalNodes, onStepUpdate),
        1000
      );

      return new Promise((resolve) => {
        algorithmState.resolve = (path) => {
          const totalCost =
            path.length > 0 ? path[path.length - 1].g : Infinity;
          resolve({ path, totalCost });
        };
      });
    } else {
      alert("Start node or goal nodes not found.");
      return Promise.resolve({ path: [], totalCost: Infinity });
    }
  } else {
    alert("Please enter a start node and at least one goal node.");
    return Promise.resolve({ path: [], totalCost: Infinity });
  }
}

function step(nodes, goalNodes, onStepUpdate) {
  if (algorithmState.openList.length === 0) {
    clearInterval(algorithmState.intervalId);
    if (!algorithmState.resolved) {
      algorithmState.resolve([]);
    }
    return;
  }

  const currNode = algorithmState.openList.reduce((prev, curr) => {
    return prev.g < curr.g ? prev : curr;
  });

  if (goalNodes.includes(currNode)) {
    algorithmState.path = reconstructPath(currNode);
    clearInterval(algorithmState.intervalId);
    algorithmState.resolved = true;
    algorithmState.resolve(algorithmState.path);
    return;
  }

  algorithmState.openList.splice(algorithmState.openList.indexOf(currNode), 1);
  algorithmState.closeList.push(currNode);

  currNode.children.forEach((child, idx) => {
    if (algorithmState.closeList.includes(child)) return;

    const edgeWeight = currNode.edges[idx];
    const tentativeG = currNode.g + edgeWeight;

    const currentNodeMap = algorithmState.nodeMap.get(child) || {
      g: Infinity,
      parent: null,
    };

    if (tentativeG < currentNodeMap.g) {
      child.g = tentativeG;
      child.parent = currNode;
      algorithmState.nodeMap.set(child, {
        g: tentativeG,
        parent: currNode,
      });

      if (!algorithmState.openList.includes(child)) {
        algorithmState.openList.push(child);
      }
    }
  });

  algorithmState.currentStep++;

  if (onStepUpdate) {
    onStepUpdate({
      currentNode: currNode,
      openList: algorithmState.openList,
      closeList: algorithmState.closeList,
    });
  }
}

function reconstructPath(goalNode) {
  const path = [];
  let current = goalNode;
  while (current) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}
