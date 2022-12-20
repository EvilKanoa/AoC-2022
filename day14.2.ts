const fs = require("fs");
const { benchmark } = require("./utils");

type Position = [number, number];
type SerializedPosition = `${number},${number}`;

interface CaveState {
  rocks: Set<SerializedPosition>;
  sand: Set<SerializedPosition>;
  bottom: number;
}

const serializePosition = ([x, y]: Position): SerializedPosition => `${x},${y}`;

const parsePosition = (str: SerializedPosition): Position => {
  const [x, y] = str.split(",");
  return [parseInt(x, 10), parseInt(y, 10)];
};

const positionsEqual = (pos1: Position, pos2: Position) =>
  pos1[0] === pos2[0] && pos1[1] === pos2[1];

const parsePath = (pathString: string): Position[] => {
  const vertices = pathString
    .split(" -> ")
    .map((str) => parsePosition(str as SerializedPosition));

  if (vertices.length < 1) {
    throw new TypeError("Path must contain at least one vertex!");
  }

  const path = [vertices.shift()!];

  for (const next of vertices) {
    for (
      let current = path[path.length - 1];
      !positionsEqual(current, next);
      current = path[path.length - 1]
    ) {
      let xOffset = 0;
      let yOffset = 0;

      if (current[0] === next[0]) {
        yOffset = next[1] > current[1] ? 1 : -1;
      } else if (current[1] === next[1]) {
        xOffset = next[0] > current[0] ? 1 : -1;
      } else {
        throw new Error("Encountered non-straight path!");
      }

      path.push([current[0] + xOffset, current[1] + yOffset]);
    }
  }

  return path;
};

const parseCave = (input: string): CaveState => {
  let lowest = 0;

  const rocks = input
    .split("\n")
    .filter((line) => line.length)
    .map((line) => parsePath(line))
    .flat(1);

  for (const rock of rocks) {
    if (rock[1] > lowest) {
      lowest = rock[1];
    }
  }

  return {
    rocks: new Set(rocks.map((rock) => serializePosition(rock))),
    sand: new Set<SerializedPosition>(),
    bottom: lowest + 2,
  };
};

const getSandMoves = (sand: Position): Position[] =>
  [
    [0, 1],
    [-1, 1],
    [1, 1],
  ].map((move) => [sand[0] + move[0], sand[1] + move[1]] as Position);

const isMoveValid = (cave: CaveState, move: Position) => {
  const str = serializePosition(move);
  return !cave.rocks.has(str) && !cave.sand.has(str) && move[1] < cave.bottom;
};

const dropSand = (cave: CaveState): boolean => {
  const sand: Position = [500, 0];

  while (true) {
    const nextMove = getSandMoves(sand).find((move) => isMoveValid(cave, move));

    if (nextMove === undefined) {
      cave.sand.add(serializePosition(sand));
      return sand[0] !== 500 || sand[1] !== 0;
    }

    sand[0] = nextMove[0];
    sand[1] = nextMove[1];
  }
};

const simulate = (cave: CaveState, display = false): void => {
  do {
    if (display) {
      console.log(printCave(cave));
    }
  } while (dropSand(cave));
};

const printCave = (caveState: CaveState): string => {
  let minX = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;

  for (const object of [
    ...caveState.rocks.values(),
    ...caveState.sand.values(),
  ]) {
    const pos = parsePosition(object);

    if (pos[0] < minX) {
      minX = pos[0];
    }

    if (pos[0] > maxX) {
      maxX = pos[0];
    }
  }

  let cave = "";
  for (let y = 0; y <= caveState.bottom; y++) {
    cave += `${y}`.padStart(3) + " ";

    for (let x = minX - 2; x <= maxX + 2; x++) {
      const pos = serializePosition([x, y]);

      if (pos === "500,0") {
        cave += "+";
      } else if (y === caveState.bottom || caveState.rocks.has(pos)) {
        cave += "#";
      } else if (caveState.sand.has(pos)) {
        cave += "o";
      } else {
        cave += ".";
      }
    }

    cave += "\n";
  }

  return cave;
};

const input = fs.readFileSync("day14.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const cave = parseCave(input);
  simulate(cave);
  result = cave.sand.size;
});

console.log(result);
