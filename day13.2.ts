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

const DIVIDER_PACKETS: Packet[] = [[[2]], [[6]]];

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

const parsePackets = (input: string): Packet[] =>
  input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => eval(line));

const input = fs.readFileSync("day13.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const packets = [...parsePackets(input), ...DIVIDER_PACKETS];
  packets.sort((a, b) =>
    isPairOrdered([a, b]) ? -1 : isPairOrdered([b, a]) ? 1 : 0
  );

  const idx1 = packets.findIndex((p) => p === DIVIDER_PACKETS[0]) + 1;
  const idx2 = packets.findIndex((p) => p === DIVIDER_PACKETS[1]) + 1;

  const decoderKey = idx1 * idx2;

  result = decoderKey;
});

console.log(result);
