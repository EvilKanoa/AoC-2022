const fs = require("fs");
const { benchmark, max } = require("./utils");

const parseGrid = (input = "") =>
  input
    .trim()
    .split("\n")
    .map((row) => [...row].map((height) => parseInt(height)));

const getScenicScore = (grid, treeRow, treeCol) => {
  const height = grid[treeRow][treeCol];

  // check from top
  let topDist = 0;
  for (let row = treeRow - 1; row >= 0; row--) {
    topDist = treeRow - row;
    if (grid[row][treeCol] >= height) {
      break;
    }
  }

  // check from bottom
  let bottomDist = 0;
  for (let row = treeRow + 1; row < grid.length; row++) {
    bottomDist = row - treeRow;
    if (grid[row][treeCol] >= height) {
      break;
    }
  }

  // check from left
  let leftDist = 0;
  for (let col = treeCol - 1; col >= 0; col--) {
    leftDist = treeCol - col;
    if (grid[treeRow][col] >= height) {
      break;
    }
  }

  // check from right
  let rightDist = 0;
  for (let col = treeCol + 1; col < grid[treeRow].length; col++) {
    rightDist = col - treeCol;
    if (grid[treeRow][col] >= height) {
      break;
    }
  }

  return topDist * bottomDist * rightDist * leftDist;
};

const input = fs.readFileSync("day8.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  const grid = parseGrid(input);
  const scores = [];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      scores.push(getScenicScore(grid, row, col));
    }
  }

  result = max(scores);
});

console.log(result);
