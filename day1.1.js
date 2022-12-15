const fs = require("fs");
const { benchmark } = require("./utils");

const contents = fs.readFileSync("day1.1.txt", { encoding: "utf-8" });

let elfs;

benchmark(() => {
  elfs = contents
    .split("\n\n")
    .map((str) => str.split("\n"))
    .map((calStrings) =>
      calStrings
        .map((calStr) => parseInt(calStr, 10))
        .reduce((acc, cals) => acc + cals, 0)
    )
    .sort((a, b) => b - a);
});

console.log(elfs[0]);
