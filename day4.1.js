const fs = require("fs");
const { benchmark } = require("./utils");

const parsePair = (pair) => {
  const [first, second] = pair.split(",");
  const [firstStart, firstEnd] = first.split("-");
  const [secondStart, secondEnd] = second.split("-");

  return [
    [parseInt(firstStart, 10), parseInt(firstEnd, 10)],
    [parseInt(secondStart, 10), parseInt(secondEnd, 10)],
  ];
};

const isFullyOverlapping = ([
  [firstStart, firstEnd],
  [secondStart, secondEnd],
]) =>
  (secondStart >= firstStart && secondEnd <= firstEnd) ||
  (firstStart >= secondStart && firstEnd <= secondEnd);

const isOverlapping = ([[firstStart, firstEnd], [secondStart, secondEnd]]) => {
  const first = new Set();
  for (let i = firstStart; i <= firstEnd; i++) {
    first.add(i);
  }

  for (let i = secondStart; i <= secondEnd; i++) {
    if (first.has(i)) {
      return true;
    }
  }

  return false;
};

const input = fs.readFileSync("day4.1.txt", { encoding: "utf-8" });
let pairs;

benchmark(() => {
  pairs = input.split("\n").map(parsePair).filter(isFullyOverlapping);
});

console.log(pairs.length);
