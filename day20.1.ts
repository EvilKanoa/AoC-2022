const fs = require("fs");
const { benchmark, mod } = require("./utils");

const parseNumbers = (input: string): number[] =>
  input
    .split("\n")
    .filter((l) => l.length)
    .map((l) => parseInt(l, 10));

const grooveCoordsOf = (numbers: number[], indices: number[]) => {
  const zeroIdx = indices.indexOf(numbers.indexOf(0));

  return (
    numbers[indices[(zeroIdx + 1000) % indices.length]] +
    numbers[indices[(zeroIdx + 2000) % indices.length]] +
    numbers[indices[(zeroIdx + 3000) % indices.length]]
  );
};

const input = fs.readFileSync("day20.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const numbers = parseNumbers(input);
  const indices = numbers.map((_, idx) => idx);

  for (let i = 0; i < numbers.length; i++) {
    const curIdx = indices.indexOf(i);
    const nextIdx = mod(curIdx + numbers[i], numbers.length - 1);

    indices.splice(curIdx, 1);
    indices.splice(nextIdx, 0, i);
  }

  result = grooveCoordsOf(numbers, indices);
});

console.log(result);

export {};
