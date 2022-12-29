import { Vector, SerializedVector, serializeVector, addVectors } from "./vector";

const fs = require("fs");
const { benchmark, max } = require("./utils");

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
  jets: Generator<Jet, Jet>;
  shapes: Generator<RockShape, RockShape>;
  highest: number;
}

const parseJets = (input: string): Jet[] =>
  [...input]
    .map((c) =>
      c === Jet.LEFT ? Jet.LEFT : c === Jet.RIGHT ? Jet.RIGHT : null
    )
    .filter((c): c is Jet => c !== null);

const createJetGenerator = (jets: Jet[]): Generator<Jet, Jet> =>
  (function* () {
    let idx = 0;
    while (true) {
      yield jets[idx++];
      idx = idx % jets.length;
    }
  })();

const createShapeGenerator = (): Generator<RockShape, RockShape> =>
  (function* () {
    const shapes = [
      RockShape.DASH,
      RockShape.PLUS,
      RockShape.ANGLE,
      RockShape.LINE,
      RockShape.CUBE,
    ];
    let idx = 0;
    while (true) {
      yield shapes[idx++];
      idx = idx % shapes.length;
    }
  })();

const isColliding = (
  positions: Vector[],
  rocks: Set<SerializedVector>
): boolean =>
  positions.some(
    (pos) =>
      pos[0] <= 0 ||
      pos[0] >= 8 ||
      pos[1] <= 0 ||
      rocks.has(serializeVector(pos))
  );

const dropRock = (state: State): void => {
  const shape = state.shapes.next().value;
  const getPositions = (fromPos: Vector) =>
    ROCK_OFFSETS[shape].map((offset) => addVectors(fromPos, offset));
  let pos: Vector = [3, state.highest + 4];

  while (true) {
    // try to push it
    const jet = state.jets.next().value;
    const pushPos = addVectors(pos, jet === Jet.LEFT ? [-1, 0] : [1, 0]);
    if (!isColliding(getPositions(pushPos), state.rocks)) {
      pos = pushPos;
    }

    // try to drop it
    const dropPos = addVectors(pos, [0, -1]);
    if (isColliding(getPositions(dropPos), state.rocks)) {
      // hit bottom or another rock, done dropping!
      break;
    }
    pos = dropPos;
  }

  const positions = getPositions(pos);
  const top = max(
    positions.map(([, y]) => y),
    0
  );
  state.highest = state.highest > top ? state.highest : top;
  positions
    .map((pos) => serializeVector(pos))
    .forEach((pos) => state.rocks.add(pos));
};

const input = fs.readFileSync("day17.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const state: State = {
    rocks: new Set(),
    jets: createJetGenerator(parseJets(input)),
    shapes: createShapeGenerator(),
    highest: 0,
  };

  for (let rock = 1; rock <= 2022; rock++) {
    dropRock(state);
  }

  result = state.highest;
});

console.log(result);

export {};
