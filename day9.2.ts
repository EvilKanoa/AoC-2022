const fs = require("fs");
const { benchmark } = require("./utils");

type Position = [number, number];

type SerializedPosition = `${number},${number}`;

interface RopeState {
  knots: Position[];
  visited: Set<SerializedPosition>;
}

interface RopeAction {
  direction: "U" | "D" | "R" | "L";
  steps: number;
}

const newRope = (): RopeState => ({
  knots: new Array(10).fill(undefined).map(() => [0, 0]),
  visited: new Set(),
});

const serializePosition = ([x, y]: Position): SerializedPosition => `${x},${y}`;

const calculateTail = (head: Position, tail: Position): Position => {
  // check if touching
  if (Math.abs(head[0] - tail[0]) < 2 && Math.abs(head[1] - tail[1]) < 2) {
    return tail;
  }

  if (head[0] === tail[0] && head[1] > tail[1]) {
    // head is above tail
    return [tail[0], tail[1] + 1];
  } else if (head[0] === tail[0] && head[1] < tail[1]) {
    // head is below tail
    return [tail[0], tail[1] - 1];
  } else if (head[1] === tail[1] && head[0] > tail[0]) {
    // head is to the right of tail
    return [tail[0] + 1, tail[1]];
  } else if (head[1] === tail[1] && head[0] < tail[0]) {
    // head is to the left of tail
    return [tail[0] - 1, tail[1]];
  } else if (head[0] > tail[0] && head[1] > tail[1]) {
    // head is up and to the right of tail
    return [tail[0] + 1, tail[1] + 1];
  } else if (head[0] > tail[0] && head[1] < tail[1]) {
    // head is down and to the right of tail
    return [tail[0] + 1, tail[1] - 1];
  } else if (head[0] < tail[0] && head[1] > tail[1]) {
    // head is up and to the left of tail
    return [tail[0] - 1, tail[1] + 1];
  } else if (head[0] < tail[0] && head[1] < tail[1]) {
    // head is down and to the left of tail
    return [tail[0] - 1, tail[1] - 1];
  }

  console.error(JSON.stringify({ head, tail }));
  throw new Error("Failed to simulate tail!");
};

const simulateRope = (state: RopeState, action: RopeAction): void => {
  if (action.steps > 1) {
    for (let step = 0; step < action.steps; step++) {
      simulateRope(state, { ...action, steps: 1 });
    }

    return;
  }

  if (action.direction === "U") {
    state.knots[0][1]++;
  } else if (action.direction === "D") {
    state.knots[0][1]--;
  } else if (action.direction === "L") {
    state.knots[0][0]--;
  } else if (action.direction === "R") {
    state.knots[0][0]++;
  }

  for (let knotIdx = 1; knotIdx < state.knots.length; knotIdx++) {
    state.knots[knotIdx] = calculateTail(
      state.knots[knotIdx - 1],
      state.knots[knotIdx]
    );

    if (knotIdx === state.knots.length - 1) {
      state.visited.add(serializePosition(state.knots[knotIdx]));
    }
  }
};

const parseInput = (input: string): RopeAction[] =>
  input
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const [direction, steps] = line.split(" ") as [
        "U" | "D" | "L" | "R",
        string
      ];
      return { direction, steps: parseInt(steps, 10) };
    });

const input = fs.readFileSync("day9.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  const actions = parseInput(input);
  const rope = newRope();

  for (const action of actions) {
    simulateRope(rope, action);
  }

  result = rope.visited.size;
});

console.log(result);
