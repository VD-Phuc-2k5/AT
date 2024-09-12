export class Node {
  constructor(label, x, y, r) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.radius = r;
    this.edges = [];
    this.children = [];
    this.parent = null;
    this.g = Infinity;
  }

  addChild(childNode) {
    this.children.push(childNode);
  }

  addEdgeWeight(val) {
    this.edges.push(val);
  }
}
