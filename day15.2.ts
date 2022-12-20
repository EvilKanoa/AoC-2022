import { manhattanDistance, parseVectorComponents, Vector } from "./vector";

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

const findBeacon = (readings: Reading[], maxRange = 4000000): Vector => {
  // couldn't do this one on my own, used the approach from this commenter: https://www.reddit.com/r/adventofcode/comments/zmcn64/2022_day_15_solutions/j0b90nr/

  const aCoeffs = [];
  const bCoeffs = [];

  for (const {
    sensor: [x, y],
    distance,
  } of readings) {
    aCoeffs.push(y - x + distance + 1);
    aCoeffs.push(y - x - distance - 1);
    bCoeffs.push(x + y + distance + 1);
    bCoeffs.push(x + y - distance - 1);
  }

  for (const a of aCoeffs) {
    for (const b of bCoeffs) {
      const check: Vector = [Math.floor((b - a) / 2), Math.floor((a + b) / 2)];

      if (
        check[0] < 0 ||
        check[0] > maxRange ||
        check[1] < 0 ||
        check[1] > maxRange
      ) {
        continue;
      }

      if (
        readings.every(
          ({ sensor, distance }) => manhattanDistance(sensor, check) > distance
        )
      ) {
        return check;
      }
    }
  }

  throw new Error("Could not find beacon!");
};

const input = fs.readFileSync("day15.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const readings = parseReadings(input);
  const beacon = findBeacon(readings);
  result = beacon[0] * 4000000 + beacon[1];
});

console.log(result);
