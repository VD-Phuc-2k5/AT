import { drawNode, drawEdge, clear } from "./canvas.js";

export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
// Accept draw node on canvas
drawNode();
// Accept draw edges on canvas
drawEdge();
// clear canvas
const clearBtn = document.getElementById("clear");
clearBtn.addEventListener("click", () => clear());
