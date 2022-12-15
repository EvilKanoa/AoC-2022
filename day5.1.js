const fs = require("fs");
const { benchmark } = require("./utils");

const parseCrates = (cratesStr) => {
  const [stacks, ...pillersStr] = cratesStr.split("\n").reverse();
  const numStacks = stacks.split(/\s+/g).filter((str) => str.length > 0).length;

  return pillersStr.reduce(
    (pillers, row) => {
      const chars = [...row];
      for (let i = 0; i < numStacks; i++) {
        const rowIdx = i * 4 + 1;
        const crate = chars[rowIdx];

        if (crate !== " ") {
          pillers[i].push(crate);
        }
      }
      return pillers;
    },
    new Array(numStacks).fill(undefined).map(() => [])
  );
};

const parseMoves = (movesStr) =>
  movesStr.split("\n").map((moveStr) => {
    const [, crateNum, origin, dest] = moveStr.match(
      /move ([0-9]+) from ([0-9]+) to ([0-9]+)/
    );

    return [parseInt(crateNum, 10), [parseInt(origin, 10), parseInt(dest, 10)]];
  });

const simulate = (moves, crates) => {
  moves.forEach(([numMove, [origin, dest]]) => {
    crates[dest - 1].push(...crates[origin - 1].splice(-numMove).reverse());
  });

  return crates.map((piller) => piller[piller.length - 1]).join("");
};

const input = fs.readFileSync("day5.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  const [cratesStr, movesStr] = input.split("\n\n");
  const moves = parseMoves(movesStr);
  const crates = parseCrates(cratesStr);
  result = simulate(moves, crates);
});

console.log(result);
