const fs = require("fs");
const { benchmark } = require("./utils");

const input = fs.readFileSync("day21.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const monkeys = Object.fromEntries(
    input
      .split("\n")
      .filter((l) => l.length)
      .map((l) => {
        const [name, exp] = l.split(": ");
        return [name, exp.includes(" ") ? exp : parseInt(exp)];
      })
  );

  const monkeyValue = (name: string): number => {
    const exp = monkeys[name];

    if (typeof exp === "number") return exp;

    const [exp1, op, exp2] = exp.split(" ");

    return eval(`${monkeyValue(exp1)} ${op} ${monkeyValue(exp2)}`);
  };

  result = monkeyValue('root');
});

console.log(result);

export {};
