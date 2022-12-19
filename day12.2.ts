const fs = require("fs");
const { benchmark } = require("./utils");

type Position = [number, number];

interface HeightMap {
  start: Position;
  end: Position;
  width: number;
  height: number;
  map: number[][];
}

const UTF8_OFFSET = -96;

const MOVEMENTS: Position[] = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const positionsEqual = (pos1: Position, pos2: Position) =>
  pos1[0] === pos2[0] && pos1[1] === pos2[1];

const addPositions = (pos1: Position, pos2: Position): Position => [
  pos1[0] + pos2[0],
  pos1[1] + pos2[1],
];

const positionInBounds = (heightMap: HeightMap, pos: Position) =>
  pos[0] >= 0 &&
  pos[0] < heightMap.height &&
  pos[1] >= 0 &&
  pos[1] < heightMap.width;

const parseHeightMap = (input: string): HeightMap => {
  let start: Position = [0, 0];
  let end: Position = [0, 0];

  const map = input
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line, y) =>
      [...line]
        .filter((char) => char.length > 0)
        .map((char, x) => {
          if (char === "S") {
            start = [y, x];
            return 1;
          } else if (char === "E") {
            end = [y, x];
            return 26;
          }

          return char.charCodeAt(0) + UTF8_OFFSET;
        })
    );

  return {
    start,
    end,
    width: map[0].length,
    height: map.length,
    map,
  };
};

const computeShortestPath = (
  heightMap: HeightMap,
  start: Position = heightMap.start
): number => {
  const distanceCache = new Array(heightMap.height)
    .fill(undefined)
    .map(() => new Array(heightMap.width).fill(undefined).map(() => -1));
  const nextSearch: Position[] = [];

  distanceCache[start[0]][start[1]] = 0;
  nextSearch.push(start);

  while (nextSearch.length > 0) {
    const next = nextSearch.shift()!;

    if (positionsEqual(next, heightMap.end)) {
      return distanceCache[next[0]][next[1]];
    }

    for (const move of MOVEMENTS) {
      const pos = addPositions(next, move);

      if (
        positionInBounds(heightMap, pos) &&
        heightMap.map[pos[0]][pos[1]] - heightMap.map[next[0]][next[1]] <= 1 &&
        distanceCache[pos[0]][pos[1]] === -1
      ) {
        distanceCache[pos[0]][pos[1]] = distanceCache[next[0]][next[1]] + 1;
        nextSearch.push(pos);
      }
    }
  }

  return -1;
};

const getSquaresAtElevation = (
  heightMap: HeightMap,
  elevation: number
): Position[] => {
  const found: Position[] = [];

  for (let y = 0; y < heightMap.height; y++) {
    for (let x = 0; x < heightMap.width; x++) {
      if (heightMap.map[y][x] === elevation) {
        found.push([y, x]);
      }
    }
  }

  return found;
};

const printPath = (heightMap: HeightMap, path: number[][]): void => {
  for (let y = 0; y < heightMap.height; y++) {
    console.log(
      heightMap.map[y]
        .map((height, x) => {
          const curPos = [y, x] as Position;

          if (path[y][x] !== -1) {
            return `${path[y][x]}`;
          } else if (positionsEqual(curPos, heightMap.start)) {
            return "S";
          } else if (positionsEqual(curPos, heightMap.end)) {
            return "E";
          }

          return String.fromCharCode(height - UTF8_OFFSET);
        })
        .map((char) => char.padStart(3))
        .join("")
    );
  }
};

const input = fs.readFileSync("day12.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const heightMap = parseHeightMap(input);
  const allPaths = getSquaresAtElevation(heightMap, 1)
    .map((start) => computeShortestPath(heightMap, start))
    .filter((path) => path !== -1)
    .sort((a, b) => a - b);
  result = allPaths[0];
});

console.log(result);
