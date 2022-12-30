export type Vector3 = [number, number, number];
export type SerializedVector3 = `${number},${number},${number}`;

export const serializeVector = (v: Vector3): SerializedVector3 =>
  `${v[0]},${v[1]},${v[2]}`;

export const parseVector = (str: SerializedVector3): Vector3 => {
  const [x, y, z] = str.split(",");
  return [parseInt(x, 10), parseInt(y, 10), parseInt(z, 10)];
};

export const parseVectorComponents = (
  x: string,
  y: string,
  z: string
): Vector3 => [parseInt(x, 10), parseInt(y, 10), parseInt(z, 10)];

export const vectorsEqual = (v1: Vector3, v2: Vector3): boolean =>
  v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];

export const addVectors = (v1: Vector3, v2: Vector3): Vector3 => [
  v1[0] + v2[0],
  v1[1] + v2[1],
  v1[2] + v2[2],
];
