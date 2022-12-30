import {
  SerializedVector,
  Vector,
  addVectors,
  parseVector,
  serializeVector,
} from "./vector";

const fs = require("fs");
const { benchmark, max } = require("./utils");

const NUM_ROCKS = 1_000_000_000_000;

enum Jet {
  LEFT = "<",
  RIGHT = ">",
}

enum RockShape {
  DASH,
  PLUS,
  ANGLE,
  LINE,
  CUBE,
}

/** List of all blocks making up a given rock shape as vectors from bottom left bbox corner. */
const ROCK_OFFSETS: Record<RockShape, readonly Vector[]> = {
  [RockShape.DASH]: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [RockShape.PLUS]: [
    [0, 1],
    [1, 2],
    [1, 1],
    [1, 0],
    [2, 1],
  ],
  [RockShape.ANGLE]: [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [RockShape.LINE]: [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [RockShape.CUBE]: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
};

interface State {
  rocks: Set<SerializedVector>;
  jets: Jet[];
  jetIdx: number;
  shapes: RockShape[];
  shapeIdx: number;
  highest: number;
}

const parseJets = (input: string): Jet[] =>
  [...input]
    .map((c) =>
      c === Jet.LEFT ? Jet.LEFT : c === Jet.RIGHT ? Jet.RIGHT : null
    )
    .filter((c): c is Jet => c !== null);

const isColliding = (positions: Vector[], rocks: State["rocks"]): boolean =>
  positions.some(
    (pos) =>
      pos[0] <= 0 ||
      pos[0] >= 8 ||
      pos[1] <= 0 ||
      rocks.has(serializeVector(pos))
  );

const getPositions = (fromPos: Vector, shape: RockShape) =>
  ROCK_OFFSETS[shape].map((offset) => addVectors(fromPos, offset));

const dropRock = (state: State): void => {
  const shape = state.shapes[state.shapeIdx++];
  state.shapeIdx = state.shapeIdx % state.shapes.length;
  let pos: Vector = [3, state.highest + 4];

  while (true) {
    // try to push it
    const jet = state.jets[state.jetIdx++];
    state.jetIdx = state.jetIdx % state.jets.length;
    const pushPos = addVectors(pos, jet === Jet.LEFT ? [-1, 0] : [1, 0]);
    if (!isColliding(getPositions(pushPos, shape), state.rocks)) {
      pos = pushPos;
    }

    // try to drop it
    const dropPos = addVectors(pos, [0, -1]);
    if (isColliding(getPositions(dropPos, shape), state.rocks)) {
      // hit bottom or another rock, done dropping!
      break;
    }
    pos = dropPos;
  }

  const positions = getPositions(pos, shape);
  const top = max(
    positions.map(([, y]) => y),
    0
  );
  state.highest = state.highest > top ? state.highest : top;
  positions.forEach((pos) => {
    state.rocks.add(serializeVector(pos));
  });
};

const findCycle = (state: State): [number, number, number] => {
  const cache = new Map<string, [number, number]>();

  const keyState = (s: State) => {
    let floor = "";
    for (let y = state.highest; y > state.highest - 30; y--) {
      for (let x = 1; x < 8; x++) {
        floor += s.rocks.has(serializeVector([x, y])) ? "1" : "0";
      }
    }
    return `${floor};${s.jetIdx};${s.shapeIdx}`;
  };

  for (let rock = 1; true; rock++) {
    dropRock(state);

    const key = keyState(state);
    if (cache.has(key)) {
      const [startRock, startHeight] = cache.get(key)!;

      return [startRock, rock - startRock, state.highest - startHeight];
    }

    cache.set(key, [rock, state.highest]);
  }
};

const input = fs.readFileSync("day17.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const state: State = {
    rocks: new Set(),
    jets: parseJets(input),
    jetIdx: 0,
    shapes: [
      RockShape.DASH,
      RockShape.PLUS,
      RockShape.ANGLE,
      RockShape.LINE,
      RockShape.CUBE,
    ],
    shapeIdx: 0,
    highest: 0,
  };

  const [cycleStart, cycleLength, cycleHeight] = findCycle(state);
  let offsetHeight = 0;
  console.log(`Using cycle:`, { cycleStart, cycleLength, cycleHeight });

  for (let rock = cycleStart + cycleLength + 1; rock <= NUM_ROCKS; rock++) {
    if (rock + cycleLength > NUM_ROCKS) {
      if (offsetHeight > 0) {
        const newRocks = new Set<SerializedVector>();
        state.rocks.forEach((posStr) => {
          const pos = parseVector(posStr);
          newRocks.add(serializeVector([pos[0], pos[1] + offsetHeight]));
        });
        state.rocks = newRocks;
        offsetHeight = 0;
      }

      dropRock(state);
    } else if (rock + cycleLength * 100 > NUM_ROCKS) {
      // apply a cycle
      rock += cycleLength - 1;
      offsetHeight += cycleHeight;
      state.highest += cycleHeight;
    } else {
      // apply 100 cycles
      rock += cycleLength * 100 - 1;
      offsetHeight += cycleHeight * 100;
      state.highest += cycleHeight * 100;
    }
  }

  result = state.highest;
});

console.log(result);

export {};
