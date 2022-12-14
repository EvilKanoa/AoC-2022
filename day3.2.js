const fs = require("fs");
const { sum } = require("./utils");

const PRIORITIES = [
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
].reduce(
  (priorities, letter, idx) => ({ ...priorities, [letter]: idx + 1 }),
  {}
);

const getBadgePriority = ([sack1, sack2, sack3]) => {
  const badge = sack1
    .filter((letter) => sack2.includes(letter))
    .find((letter) => sack3.includes(letter));

  return PRIORITIES[badge];
};

const sacks = fs
  .readFileSync("day3.1.txt", { encoding: "utf-8" })
  .split("\n")
  .map((contents) => [...contents]);

// group the sacks
const groups = [];
while (sacks.length >= 3) {
  groups.push(sacks.splice(0, 3));
}

console.log(groups.map(getBadgePriority).reduce(sum));
