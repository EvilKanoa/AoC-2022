import {
  SerializedVector3,
  Vector3,
  addVectors,
  parseVector,
  serializeVector,
} from "./vector3";

const fs = require("fs");
const { benchmark } = require("./utils");

enum AirState {
  INTERNAL,
  EXTERNAL,
}

const SIDES: Vector3[] = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];

interface Bounds {
  min: Vector3;
  max: Vector3;
}

const parseCubes = (input: string): [Set<SerializedVector3>, Bounds] => {
  const b: Bounds = {
    min: [
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
    ],
    max: [
      Number.MIN_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
    ],
  };

  const cubes = input
    .split("\n")
    .filter((l) => l.length)
    .map((l) => {
      const vec = parseVector(l as any);

      for (let i = 0; i < 3; i++) {
        if (vec[i] < b.min[i]) {
          b.min[i] = vec[i];
        }
        if (vec[i] > b.max[i]) {
          b.max[i] = vec[i];
        }
      }

      return vec;
    })
    .reduce((set, vec) => {
      set.add(serializeVector(vec));
      return set;
    }, new Set<SerializedVector3>());

  return [cubes, b];
};

const inBounds = (vec: Vector3, b: Bounds) =>
  vec[0] >= b.min[0] &&
  vec[0] <= b.max[0] &&
  vec[1] >= b.min[1] &&
  vec[1] <= b.max[1] &&
  vec[2] >= b.min[2] &&
  vec[2] <= b.max[2];

const printAirStates = (
  states: (AirState | undefined)[][][],
  bounds: Bounds
) => {
  for (let x = bounds.min[0]; x <= bounds.max[0]; x++) {
    console.log(`Slice when x = ${x}:`);
    for (let y = bounds.min[1]; y <= bounds.max[1]; y++) {
      let line = "";

      for (let z = bounds.min[2]; z <= bounds.max[2]; z++) {
        const s =
          states[x - bounds.min[0]][y - bounds.min[1]][z - bounds.min[2]];

        if (s === undefined) {
          line += " ";
        } else if (s === AirState.EXTERNAL) {
          line += "E";
        } else {
          line += "#";
        }
      }

      console.log(line);
    }
  }
};

const computeAirStates = (
  cubes: Set<SerializedVector3>,
  bounds: Bounds
): AirState[][][] => {
  const air: (AirState | undefined)[][][] = new Array(
    bounds.max[0] - bounds.min[0] + 1
  )
    .fill(undefined)
    .map(() =>
      new Array(bounds.max[1] - bounds.min[1] + 1)
        .fill(undefined)
        .map(() => new Array(bounds.max[2] - bounds.min[2] + 1).fill(undefined))
    );

  const setAirState = (vec: Vector3, state: AirState) =>
    (air[vec[0] - bounds.min[0]][vec[1] - bounds.min[1]][
      vec[2] - bounds.min[2]
    ] = state);

  const getAirState = (vec: Vector3): AirState | undefined =>
    air[vec[0] - bounds.min[0]][vec[1] - bounds.min[1]][vec[2] - bounds.min[2]];

  // prefill with cubes
  for (const cube of cubes.values()) {
    setAirState(parseVector(cube), AirState.INTERNAL);
  }

  // printAirStates(air, bounds);

  let isFilled = false;
  while (!isFilled) {
    // printAirStates(air, bounds);
    isFilled = true;

    for (let x = bounds.min[0]; x <= bounds.max[0]; x++) {
      for (let y = bounds.min[1]; y <= bounds.max[1]; y++) {
        for (let z = bounds.min[2]; z <= bounds.max[2]; z++) {
          const vec = [x, y, z] as Vector3;
          const curState = getAirState(vec);

          if (curState !== undefined) continue;

          // check if vec is bordering air block
          if (
            x === bounds.max[0] ||
            x === bounds.max[0] ||
            y === bounds.max[1] ||
            y === bounds.max[1] ||
            z === bounds.max[2] ||
            z === bounds.max[2]
          ) {
            isFilled = false;
            setAirState(vec, AirState.EXTERNAL);
            continue;
          }

          let hasExternal = false;
          let isUnknown = false;
          SIDES.map((side) => addVectors(vec, side))
            .map((vec) =>
              inBounds(vec, bounds) ? getAirState(vec) : AirState.EXTERNAL
            )
            .forEach((state) => {
              if (state === undefined) {
                isUnknown = true;
              } else if (state === AirState.EXTERNAL) {
                hasExternal = true;
              }
            });

          if (hasExternal) {
            setAirState(vec, AirState.EXTERNAL);
            isFilled = false;
          } else if (!isUnknown) {
            setAirState(vec, AirState.INTERNAL);
            isFilled = false;
          }
        }
      }
    }
  }

  return air.map((states) =>
    states.map((states) => states.map((state) => state ?? AirState.INTERNAL))
  );
};

const input = fs.readFileSync("day18.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const [cubes, bounds] = parseCubes(input);
  const states = computeAirStates(cubes, bounds);

  const getAirState = (vec: Vector3): AirState =>
    states[vec[0] - bounds.min[0]][vec[1] - bounds.min[1]][
      vec[2] - bounds.min[2]
    ];

  let sa = 0;
  for (const cube of cubes.values()) {
    const vec = parseVector(cube);
    SIDES.map((side) => addVectors(vec, side))
      .filter(
        (vec) =>
          !inBounds(vec, bounds) || getAirState(vec) === AirState.EXTERNAL
      )
      .forEach(() => {
        sa++;
      });
  }

  result = sa;
});

console.log(result);

export {};
