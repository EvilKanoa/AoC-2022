const fs = require("fs");
const { benchmark } = require("./utils");

type Operator = "*" | "+" | "/" | "-";
interface ComplexExpression {
  lhs: string | Expression;
  rhs: string | Expression;
  op: Operator;
}
type Expression = number | ComplexExpression;
type Monkeys = Record<string, Expression>;

const parseMonkeys = (input: string): Monkeys =>
  Object.fromEntries(
    input
      .split("\n")
      .filter((l) => l.length)
      .map((l) => {
        const [name, exp] = l.split(": ");

        if (!exp.includes(" ")) {
          return [name, parseInt(exp, 10)];
        }

        const [lhs, op, rhs] = exp.split(" ");
        return [name, { lhs, rhs, op }];
      })
  );

const simplify = (monkeys: Monkeys, nameOrExp: string | Expression): string => {
  if (typeof nameOrExp === "number") {
    return `${nameOrExp}`;
  } else if (nameOrExp === "humn") {
    return "x";
  }

  const expression =
    typeof nameOrExp === "string" ? monkeys[nameOrExp] : nameOrExp;

  if (typeof expression === "number") {
    return `${expression}`;
  }

  return `(${simplify(monkeys, expression.lhs)} ${expression.op} ${simplify(
    monkeys,
    expression.rhs
  )})`;
};

const input = fs.readFileSync("day21.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const monkeys = parseMonkeys(input);
  const root = monkeys["root"] as ComplexExpression;

  const containsX = (nameOrExp: string | Expression): boolean => {
    if (nameOrExp === "humn") {
      return true;
    }

    const expression =
      typeof nameOrExp === "string" ? monkeys[nameOrExp] : nameOrExp;

    return (
      typeof expression !== "number" &&
      (containsX(expression.lhs) || containsX(expression.rhs))
    );
  };

  let lhs: string, rhs: string | Expression;

  if (containsX(root.lhs)) {
    lhs = root.lhs as string;
    rhs = root.rhs;
  } else {
    lhs = root.rhs as string;
    rhs = root.lhs;
  }

  const printEquality = () =>
    console.log(`${simplify(monkeys, lhs)} = ${simplify(monkeys, rhs)}`);

  while (lhs !== "humn") {
    const lhsExp = monkeys[lhs];
    if (typeof lhsExp === "number") {
      throw "Uh oh, this should not happen :(";
    }

    let newLhs = containsX(lhsExp.lhs) ? lhsExp.lhs : lhsExp.rhs;
    let oldLhs = newLhs === lhsExp.lhs ? lhsExp.rhs : lhsExp.lhs;

    if (lhsExp.op === "/") {
      rhs = {
        lhs: rhs,
        rhs: oldLhs,
        op: "*",
      };
    } else if (lhsExp.op === "*") {
      rhs = {
        lhs: rhs,
        rhs: oldLhs,
        op: "/",
      };
    } else if (lhsExp.op === "+") {
      rhs = {
        lhs: rhs,
        rhs: oldLhs,
        op: "-",
      };
    } else if (lhsExp.op === "-") {
      rhs = {
        lhs: rhs,
        rhs: oldLhs,
        op: "+",
      };

      // special case: (expr - x)
      if (newLhs === lhsExp.rhs) {
        rhs = {
          lhs: {
            ...rhs,
            op: "-",
          },
          rhs: -1,
          op: "*",
        };
      }
    } else {
      throw "Unknown operator";
    }

    lhs = newLhs as string;
  }

  result = eval(simplify(monkeys, rhs));
});

console.log(result);

export {};
