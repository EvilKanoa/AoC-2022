const fs = require("fs");
const { benchmark } = require("./utils");

function* markerIter(chars = "", markerSize = 4) {
  for (let i = markerSize; i <= chars.length; i++) {
    yield chars.substring(i - markerSize, i);
  }
  return;
}

const isMarker = (check = "") => {
  const seen = new Set();
  return [...check].every((letter) => {
    if (seen.has(letter)) {
      return false;
    }
    seen.add(letter);
    return true;
  });
};

const input = fs.readFileSync("day6.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  let count = 4;
  for (const testMarker of markerIter(input)) {
    if (isMarker(testMarker)) {
      break;
    }
    count++;
  }
  result = count;
});

console.log(result);
