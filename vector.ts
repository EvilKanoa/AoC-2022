export type Vector = [number, number];
export type SerializedVector = `${number},${number}`;

export const serializeVector = (v: Vector): SerializedVector =>
  `${v[0]},${v[1]}`;

export const parseVector = (str: SerializedVector): Vector => {
  const [x, y] = str.split(",");
  return [parseInt(x, 10), parseInt(y, 10)];
};

export const parseVectorComponents = (x: string, y: string): Vector => [
  parseInt(x, 10),
  parseInt(y, 10),
];

export const vectorsEqual = (v1: Vector, v2: Vector): boolean =>
  v1[0] === v2[0] && v1[1] === v2[1];

export const addVectors = (v1: Vector, v2: Vector): Vector => [
  v1[0] + v2[0],
  v1[1] + v2[1],
];

export const manhattanDistance = (v1: Vector, v2: Vector): number =>
  Math.abs(v1[0] - v2[0]) + Math.abs(v1[1] - v2[1]);
