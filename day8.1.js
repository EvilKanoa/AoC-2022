const fs = require("fs");
const { benchmark } = require("./utils");

const parseGrid = (input = "") =>
  input
    .trim()
    .split("\n")
    .map((row) => [...row].map((height) => parseInt(height)));

const isTreeVisible = (grid, treeRow, treeCol) => {
  const height = grid[treeRow][treeCol];

  // check from top
  let topVisible = true;
  for (let row = 0; row < treeRow; row++) {
    if (grid[row][treeCol] >= height) {
      topVisible = false;
      break;
    }
  }

  // check from bottom
  let bottomVisible = true;
  for (let row = grid.length - 1; row > treeRow; row--) {
    if (grid[row][treeCol] >= height) {
      bottomVisible = false;
      break;
    }
  }

  // check from left
  let leftVisible = true;
  for (let col = 0; col < treeCol; col++) {
    if (grid[treeRow][col] >= height) {
      leftVisible = false;
      break;
    }
  }

  // check from right
  let rightVisible = true;
  for (let col = grid[treeRow].length - 1; col > treeCol; col--) {
    if (grid[treeRow][col] >= height) {
      rightVisible = false;
      break;
    }
  }

  return topVisible || bottomVisible || rightVisible || leftVisible;
};

const input = fs.readFileSync("day8.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  const grid = parseGrid(input);
  let visible = 0;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (isTreeVisible(grid, row, col)) {
        visible++;
      }
    }
  }

  result = visible;
});

console.log(result);
