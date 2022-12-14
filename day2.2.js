const fs = require("fs");

const results = {
  "A X": 3 + 0,
  "A Y": 1 + 3,
  "A Z": 2 + 6,
  "B X": 1 + 0,
  "B Y": 2 + 3,
  "B Z": 3 + 6,
  "C X": 2 + 0,
  "C Y": 3 + 3,
  "C Z": 1 + 6,
};

const score = fs
  .readFileSync("day2.1.txt", { encoding: "utf-8" })
  .split("\n")
  .map((round) => results[round])
  .reduce((acc, x) => acc + x, 0);

console.log(score);
