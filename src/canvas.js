import { canvas, ctx } from "./app.js";
import { Node } from "./node.js";
import { AT } from "./AT.js";

const selectedNodes = new Set();
let idx = 0;
const nodes = [];
const edges = [];
let isDrawNode = true;
let isLabelingEdge = false;

function isInsideNode(node, e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
  return distance < node.radius;
}

function isPointOnLine(px, py, x1, y1, x2, y2, tolerance = 15) {
  const lineLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  if (lineLen === 0)
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2) <= tolerance;

  const u = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLen ** 2;
  const closestX = x1 + u * (x2 - x1);
  const closestY = y1 + u * (y2 - y1);

  const onSegment = u >= 0 && u <= 1;
  if (onSegment) {
    const distance = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
    return distance <= tolerance;
  }

  const distanceToStart = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  const distanceToEnd = Math.sqrt((px - x2) ** 2 + (py - y2) ** 2);
  return distanceToStart <= tolerance || distanceToEnd <= tolerance;
}

function drawCircle(x, y, label) {
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.fillStyle = "White";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "16px Arial";
  ctx.fillText(label, x, y);
}

function drawLine(startNode, endNode, label = "", color = "black") {
  if (!startNode || !endNode) return;
  ctx.beginPath();
  ctx.moveTo(startNode.x, startNode.y);
  ctx.lineTo(endNode.x, endNode.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (label) {
    const midX = (startNode.x + endNode.x) / 2;
    const midY = (startNode.y + endNode.y) / 2;
    ctx.font = "12px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, midX - 15, midY);
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  edges.forEach(({ startNode, endNode, label }) =>
    drawLine(startNode, endNode, label)
  );
  nodes.forEach(({ x, y, label }) => drawCircle(x, y, label));
}

export function drawNode() {
  canvas.addEventListener("click", (e) => {
    if (isLabelingEdge) return;

    const newNode = new Node(`${++idx}`, e.offsetX, e.offsetY, 15);

    const isExistNode = nodes.find((node) => isInsideNode(node, e));
    if (!isExistNode) {
      isDrawNode = true;
      nodes.push(newNode);
      redraw();
      selectedNodes.clear();
    } else {
      isDrawNode = false;
      --idx;
    }
  });
}

export function drawEdge() {
  function handleClick(e) {
    const clickedNode = nodes.find((node) => isInsideNode(node, e));

    if (clickedNode && !isDrawNode) {
      selectedNodes.add(clickedNode);
      if (selectedNodes.size === 2) {
        const [startNode, endNode] = Array.from(selectedNodes);
        const newLabel = prompt("Nhập trọng số cho cạnh:") || "";
        startNode.addChild(endNode);
        endNode.addChild(startNode);
        startNode.addEdgeWeight(Number.parseFloat(newLabel));
        endNode.addEdgeWeight(Number.parseFloat(newLabel));
        edges.push({ startNode, endNode, label: newLabel });
        redraw();
        selectedNodes.clear();
      }
    }
  }

  function handleMouseMove(e) {
    if (selectedNodes.size === 1) {
      const endNode = {
        x: e.offsetX,
        y: e.offsetY,
      };
      redraw();
      drawLine(Array.from(selectedNodes)[0], endNode);
    }
  }

  canvas.removeEventListener("click", handleClick);
  canvas.addEventListener("click", handleClick);

  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousemove", handleMouseMove);
}

export function clear() {
  idx = 0;
  nodes.length = 0;
  edges.length = 0;
  selectedNodes.clear();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateUI(stepInfo) {
  const stepDisplay = document.getElementById("stepDisplay");
  const div = document.createElement("div");
  div.id = "stepDisplay-item";
  div.innerHTML = `
    <strong>Current Node:</strong> ${stepInfo.currentNode.label}
    <strong>Open List:</strong> ${stepInfo.openList
      .map((node) => node.label)
      .join(", ")}
    <strong>Close List:</strong> ${stepInfo.closeList
      .map((node) => node.label)
      .join(", ")}
  `;
  stepDisplay.appendChild(div);
}

document.getElementById("run").addEventListener("click", async (e) => {
  document.getElementById("stepDisplay").innerHTML = "";
  const { path, totalCost } = await AT(nodes, updateUI);

  if (path.length > 0) {
    alert("Success");
    console.log("Shortest path found:");
    path.forEach((node) => {
      console.log(`Node ${node.label} at (${node.x}, ${node.y})`);
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw();
    path.forEach((node, index) => {
      if (index < path.length - 1) {
        const nextNode = path[index + 1];
        drawLine(node, nextNode, "", "Green");
      }
    });

    document.getElementById(
      "costDisplay"
    ).textContent = `Total Cost: ${totalCost}`;
  } else {
    alert("No path found.");
    document.getElementById("costDisplay").textContent = "Total Cost: Infinity";
  }
});
