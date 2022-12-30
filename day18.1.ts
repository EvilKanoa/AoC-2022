import {
  SerializedVector3,
  Vector3,
  addVectors,
  parseVector,
  serializeVector,
} from "./vector3";

const fs = require("fs");
const { benchmark } = require("./utils");

const SIDES: Vector3[] = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const parseCubes = (input: string): Set<SerializedVector3> =>
  input
    .split("\n")
    .filter((l) => l.length)
    .map((l) => parseVector(l as any))
    .reduce((set, vec) => {
      set.add(serializeVector(vec));
      return set;
    }, new Set<SerializedVector3>());

const input = fs.readFileSync("day18.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const cubes = parseCubes(input);

  let sa = 0;
  for (const cube of cubes.values()) {
    const vec = parseVector(cube);
    SIDES.map((side) => serializeVector(addVectors(vec, side)))
      .filter((vec) => !cubes.has(vec))
      .forEach(() => sa++);
  }

  result = sa;
});

console.log(result);

export {};
