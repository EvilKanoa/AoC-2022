const fs = require("fs");
const { benchmark } = require("./utils");

enum Jet {
  LEFT = "<",
  RIGHT = ">",
}

const parseJets = (input: string): Jet[] =>
  [...input]
    .map((c) =>
      c === Jet.LEFT ? Jet.LEFT : c === Jet.RIGHT ? Jet.RIGHT : null
    )
    .filter((c): c is Jet => c !== null);

const createJetGenerator = (jets: Jet[]): Generator<Jet, void> =>
  (function* () {
    let idx = 0;
    while (true) {
      yield jets[idx++];
      idx = idx % jets.length;
    }
  })();

const input = fs.readFileSync("day17.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {}, true);

console.log(result);

export {};
