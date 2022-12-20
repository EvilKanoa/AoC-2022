import {
  manhattanDistance,
  parseVectorComponents,
  Vector,
  vectorsEqual,
} from "./vector";

const fs = require("fs");
const { benchmark } = require("./utils");

const SENSOR_REGEX =
  /Sensor at x=(?<sensorX>-?[0-9]+), y=(?<sensorY>-?[0-9]+): closest beacon is at x=(?<beaconX>-?[0-9]+), y=(?<beaconY>-?[0-9]+)/;

interface Reading {
  sensor: Vector;
  beacon: Vector;
  distance: number;
}

const parseReadings = (input: string): Reading[] =>
  input
    .split("\n")
    .filter((line) => line.length)
    .map((line) => {
      const match = line.match(SENSOR_REGEX);
      if (!match || !match.groups) {
        throw new Error(`Failed to parse sensor reading: ${line}`);
      }

      const { sensorX, sensorY, beaconX, beaconY } = match.groups;

      const sensor = parseVectorComponents(sensorX, sensorY);
      const beacon = parseVectorComponents(beaconX, beaconY);

      return {
        sensor,
        beacon,
        distance: manhattanDistance(sensor, beacon),
      };
    });

const findBounds = (readings: Reading[]): Vector => {
  let minX = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;

  for (const { sensor, distance } of readings) {
    const minSensorX = sensor[0] - distance;
    const maxSensorX = sensor[0] + distance;

    if (minSensorX < minX) {
      minX = minSensorX;
    }

    if (maxSensorX > maxX) {
      maxX = maxSensorX;
    }
  }

  return [minX - 1, maxX + 1];
};

const wasScanned = (readings: Reading[], check: Vector): boolean =>
  readings.every(({ beacon }) => !vectorsEqual(beacon, check)) &&
  readings.some(
    ({ sensor, distance }) => manhattanDistance(check, sensor) <= distance
  );

const countScannedInRow = (readings: Reading[], row = 2000000): number => {
  const [minX, maxX] = findBounds(readings);
  let scanned = 0;

  for (let x = minX; x <= maxX; x++) {
    if (wasScanned(readings, [x, row])) {
      // console.log([x, row]);
      scanned++;
    }
  }

  return scanned;
};

const input = fs.readFileSync("day15.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const readings = parseReadings(input);
  result = countScannedInRow(readings);
});

console.log(result);
