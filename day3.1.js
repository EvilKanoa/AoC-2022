const fs = require("fs");
const { sum, benchmark } = require("./utils");

const PRIORITIES = [
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
].reduce(
  (priorities, letter, idx) => ({ ...priorities, [letter]: idx + 1 }),
  {}
);

const getSackPriority = (sack = []) => {
  const compartment1 = sack.slice(undefined, sack.length / 2);
  const compartment2 = sack.slice(sack.length / 2);

  // TODO: Could use a set or hashmap to optimize, but I can't imagine it'll help much with each sack being relatively small
  const mistake = compartment1.find((letter) => compartment2.includes(letter));

  return PRIORITIES[mistake];
};

const input = fs.readFileSync("day3.1.txt", { encoding: "utf-8" });

let sumPriorities;

benchmark(() => {
  const sacks = input.split("\n").map((contents) => [...contents]);

  sumPriorities = sacks.map(getSackPriority).reduce(sum);
});

console.log(sumPriorities);
