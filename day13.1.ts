const fs = require("fs");
const { benchmark, sum } = require("./utils");

const PRINT_DEBUG = false;

const debug = (msg: string) => {
  if (PRINT_DEBUG) {
    console.log(msg);
  }
};

type PacketComponent = number | Array<PacketComponent>;
type Packet = Array<PacketComponent>;
type PacketPair = [Packet, Packet];
type PacketComponentPair = [PacketComponent, PacketComponent];

const InOrder = new Error("In order");
const OutOfOrder = new Error("Out of order");

const isPairComponentOrdered = ([left, right]: PacketComponentPair): void => {
  debug(`- Compare ${JSON.stringify(left)} vs ${JSON.stringify(right)}`);

  if (typeof left === "number" && typeof right === "number") {
    if (left < right) {
      debug("- Left side is smaller, so inputs are in the right order");
      throw InOrder;
    } else if (left > right) {
      debug("- Right side is smaller, so inputs are not in the right order");
      throw OutOfOrder;
    }
    return;
  } else if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; true; i++) {
      const leftOut = i >= left.length;
      const rightOut = i >= right.length;

      if (leftOut && rightOut) {
        return;
      } else if (leftOut) {
        debug("- Left side ran out of items, so inputs are in the right order");
        throw InOrder;
      } else if (rightOut) {
        debug(
          "- Right side ran out of items, so inputs are not in the right order"
        );
        throw OutOfOrder;
      }

      isPairComponentOrdered([left[i], right[i]]);
    }
  } else {
    const leftArray = typeof left === "number" ? [left] : left;
    const rightArray = typeof right === "number" ? [right] : right;

    if (Array.isArray(left)) {
      debug(
        `- Mixed types; convert right to ${JSON.stringify(
          rightArray
        )} and retry comparison`
      );
    } else {
      debug(
        `- Mixed types; convert left to ${JSON.stringify(
          leftArray
        )} and retry comparison`
      );
    }

    isPairComponentOrdered([leftArray, rightArray]);
  }
};

const isPairOrdered = (pair: PacketPair): boolean => {
  debug("=== Comparing Pair ===");

  try {
    isPairComponentOrdered(pair);
  } catch (e) {
    if (e === InOrder) {
      debug("=== In Order ===");
      return true;
    } else if (e === OutOfOrder) {
      debug("=== Out Of Order ===");
      return false;
    }

    throw e;
  } finally {
    debug("");
  }

  throw new Error("Failed to compare pairs!");
};

const parsePackets = (input: string): PacketPair[] =>
  input
    .split("\n\n")
    .filter((line) => line.length > 0)
    .map((pairStr) => {
      const [p1, p2] = pairStr.split("\n");
      return [eval(p1.trim()), eval(p2.trim())];
    });

const input = fs.readFileSync("day13.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const pairs = parsePackets(input);
  result = pairs
    .map<[PacketPair, number]>((pair, idx) => [pair, idx + 1])
    .filter(([pair]) => isPairOrdered(pair))
    .map(([, idx]) => idx)
    .reduce(sum, 0);
});

console.log(result);
