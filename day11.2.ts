const fs = require("fs");
const { benchmark } = require("./utils");

const MONKEY_REGEX =
  /Monkey [0-9]+:\n\s+Starting items: (?<startingItems>[0-9, ]+)\n\s+Operation: new = (?<operand1>old|[0-9]+) (?<operandType>\+|\*) (?<operand2>old|[0-9]+)\n\s+Test: divisible by (?<testDivisor>[0-9]+)\n\s+If true: throw to monkey (?<onTrue>[0-9]+)\n\s+If false: throw to monkey (?<onFalse>[0-9]+)/;

interface Monkey {
  items: number[];
  inspectionCount: number;
  operation: {
    type: "add" | "multiply";
    operand1: number | undefined;
    operand2: number | undefined;
  };
  test: {
    divisor: number;
    onTrue: number;
    onFalse: number;
  };
}

const parseMonkey = (input: string): Monkey | undefined => {
  const match = input.match(MONKEY_REGEX);
  if (!match || !match.groups) {
    return undefined;
  }

  const {
    startingItems,
    operandType,
    operand1,
    operand2,
    testDivisor,
    onTrue,
    onFalse,
  } = match.groups;

  return {
    inspectionCount: 0,
    items: startingItems
      .split(/,\s*/gi)
      .filter((x) => x && x.length > 0)
      .map((x) => parseInt(x, 10)),
    operation: {
      type: operandType === "*" ? "multiply" : "add",
      operand1: operand1 === "old" ? undefined : parseInt(operand1, 10),
      operand2: operand2 === "old" ? undefined : parseInt(operand2, 10),
    },
    test: {
      divisor: parseInt(testDivisor, 10),
      onTrue: parseInt(onTrue, 10),
      onFalse: parseInt(onFalse, 10),
    },
  };
};

const parseInput = (input: string): Monkey[] =>
  input
    .split("\n\n")
    .filter((str) => str.length > 0)
    .map((monkeyStr) => parseMonkey(monkeyStr))
    .filter((monkey): monkey is Monkey => !!monkey);

const executeRound = (
  monkeys: Monkey[],
  log: (msg: string) => void = console.log,
  worryRange: number | undefined = undefined
): void => {
  for (let i = 0; i < monkeys.length; i++) {
    log(`Monkey ${i}:`);

    for (const item of monkeys[i].items) {
      log(`  Monkey inspects an item with a worry level of ${item}.`);
      const op1 = monkeys[i].operation.operand1 ?? item;
      const op2 = monkeys[i].operation.operand2 ?? item;

      let newItem = item;
      if (monkeys[i].operation.type === "add") {
        newItem = op1 + op2;
        log(`    Worry level increases by ${op2} to ${newItem}.`);
      } else {
        newItem = op1 * op2;
        log(`    Worry level is multiplied by ${op2} to ${newItem}.`);
      }

      if (worryRange !== undefined) {
        newItem = newItem % worryRange;
        log(
          `    Worry level is brought in range of ${worryRange} to ${newItem}.`
        );
      }

      let target: number;
      if (newItem % monkeys[i].test.divisor === 0) {
        log(
          `    Current worry level is divisible by ${monkeys[i].test.divisor}.`
        );
        target = monkeys[i].test.onTrue;
      } else {
        log(
          `    Current worry level is not divisible by ${monkeys[i].test.divisor}.`
        );
        target = monkeys[i].test.onFalse;
      }

      log(
        `    Item with worry level ${newItem} is thrown to monkey ${target}.`
      );
      monkeys[target].items.push(newItem);
      monkeys[i].inspectionCount++;
    }

    monkeys[i].items = [];
  }
};

const getWorryRange = (monkeys: Monkey[]): number =>
  monkeys
    .map((monkey) => monkey.test.divisor)
    .reduce((acc, divisor) => acc * divisor, 1);

const input = fs.readFileSync("day11.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const monkeys = parseInput(input);
  const worryRange = getWorryRange(monkeys);

  for (let i = 0; i < 10_000; i++) {
    executeRound(monkeys, () => {}, worryRange);
  }

  let countMax = 0,
    countMax2 = 0;
  // find two highest inspection counts
  for (const monkey of monkeys) {
    if (monkey.inspectionCount > countMax2) {
      countMax2 = monkey.inspectionCount;
    }

    if (countMax2 > countMax) {
      let tmp = countMax;
      countMax = countMax2;
      countMax2 = tmp;
    }
  }

  result = countMax * countMax2;
});

console.log(result);
