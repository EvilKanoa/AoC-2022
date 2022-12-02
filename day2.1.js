const fs = require("fs");

const results = {
  "A X": 3 + 1,
  "A Y": 6 + 2,
  "A Z": 0 + 3,
  "B X": 0 + 1,
  "B Y": 3 + 2,
  "B Z": 6 + 3,
  "C X": 6 + 1,
  "C Y": 0 + 2,
  "C Z": 3 + 3,
};

const score = fs
  .readFileSync("day2.1.txt", { encoding: "utf-8" })
  .split("\n")
  .map((round) => results[round])
  .reduce((acc, x) => acc + x, 0);

console.log(score);
