const fs = require("fs");
const { benchmark, max } = require("./utils");

interface Valve {
  valve: string;
  rate: number;
  tunnels: string[];
}

type ValveTable = Record<string, Valve>;

const parseValues = (input: string): ValveTable =>
  input
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(
        /Valve (?<valve>[A-Z]+) has flow rate=(?<rate>[0-9]+); tunnels? leads? to valves? (?<tunnels>[A-Z,\s]+)/i
      );
      const { valve, rate, tunnels } = match?.groups as any;

      return {
        valve,
        rate: parseInt(rate, 10),
        tunnels: tunnels.split(", "),
      };
    })
    .reduce<ValveTable>((table, valve) => {
      table[valve.valve] = valve;
      return table;
    }, {});

interface State {
  /** The valve name of the position that the player is last at */
  pPos: string;
  /** The valve name of the previous position that the player was at */
  lastP?: string;
  /** The valve name of the position that the elephant is last at */
  ePos: string;
  /** The valve name of the previous position that the elephant was at */
  lastE?: string;
  /** Set of all currently opened valves */
  opened: string[];
  /** Number of minutes until eruption */
  remainingTime: number;
}

type PartialState = Omit<State, "remainingTime">;

type ValveDistances = Record<`${string},${string}`, number>;

class Pathfinder {
  #cache: Record<string, Record<string, Record<string, number>>> = {};
  #valves: ValveTable;
  #timeLimit: number;
  #start: string;
  #numValves: number;
  #numUsableValves: number;
  #tentativeBest: number = 0;
  #calls: number = 0;
  #cacheHits: number = 0;
  #cacheMisses: number = 0;
  #cacheSize: number = 0;
  #debug: false | 1 | 2 = false;
  #distances: ValveDistances;

  constructor(valves: ValveTable, timeLimit: number, start: string) {
    this.#valves = valves;
    this.#timeLimit = timeLimit;
    this.#start = start;

    this.#numValves = Object.keys(this.#valves).length;
    this.#numUsableValves = Object.keys(valves).filter(
      (valve) => this.#valves[valve].rate > 0
    ).length;

    this.#distances = this.#computeDistances();
  }

  solve = (debug: false | 1 | 2 = false): number => {
    this.#debug = debug;
    this.#tentativeBest = 0;
    this.#calls = 0;
    this.#cacheHits = 0;
    this.#cacheMisses = 0;
    this.#cacheSize = 0;

    const result = this.#bestPath({
      pPos: this.#start,
      ePos: this.#start,
      opened: [],
      remainingTime: this.#timeLimit,
    });

    if (this.#debug) {
      console.log({
        calls: this.#calls,
        cacheHits: this.#cacheHits,
        cacheMisses: this.#cacheMisses,
        cacheSize: this.#cacheSize,
        cacheRatio:
          (this.#cacheHits * 100) / (this.#cacheHits + this.#cacheMisses),
      });
    }

    return result;
  };

  #keyOfPair = (valveA: string, valveB: string) =>
    `${[valveA, valveB].sort().join(",")}` as `${string},${string}`;

  #computeDistances = (): ValveDistances => {
    const distances: ValveDistances = {};

    const valves = Object.keys(this.#valves);
    for (const valve of valves) {
      this.#computeDistanceOf(valve, valve, 0, [], distances);
    }

    return distances;
  };

  #computeDistanceOf = (
    start: string,
    current: string,
    distance: number,
    visited: string[],
    distances: ValveDistances
  ) => {
    if (visited.length >= this.#numValves) {
      return;
    }

    const key = this.#keyOfPair(start, current);
    if (!distances[key] || distances[key] > distance) {
      distances[key] = distance;
    }

    const newVisited = [...visited, current];
    this.#valves[current].tunnels
      .filter((tunnel) => !visited.includes(tunnel))
      .forEach((tunnel) =>
        this.#computeDistanceOf(
          start,
          tunnel,
          distance + 1,
          newVisited,
          distances
        )
      );
  };

  #cacheKeyOf = ({
    pPos,
    ePos,
    opened,
    remainingTime,
  }: State): [string, string, string] => [
    `${[pPos, ePos].sort()}`,
    `${remainingTime}`,
    opened
      .filter(
        (tun) =>
          this.#distances[this.#keyOfPair(pPos, tun)] < remainingTime ||
          this.#distances[this.#keyOfPair(ePos, tun)] < remainingTime
      )
      .sort()
      .join(","),
  ];

  #cacheGet = (key: [string, string, string]): number | null => {
    const value = this.#cache[key[0]]?.[key[1]]?.[key[2]] ?? null;

    if (value === null) {
      this.#cacheMisses++;
    } else {
      this.#cacheHits++;
    }

    return value;
  };

  #cacheSet = (key: [string, string, string], value: number): void => {
    if (this.#cache[key[0]]?.[key[1]]?.[key[2]] === undefined) {
      this.#cacheSize++;
      this.#cache[key[0]] = this.#cache[key[0]] || {};
      this.#cache[key[0]][key[1]] = this.#cache[key[0]][key[1]] || {};
    }

    if (this.#debug > 1 && this.#cacheSize % 100_000 === 0) {
      console.log("cache size:", this.#cacheSize);
    }

    this.#cache[key[0]][key[1]][key[2]] = value;
  };

  #bestPath = (state: State): number => {
    const { pPos, ePos, opened, remainingTime, lastE, lastP } = state;
    this.#calls++;

    if (remainingTime <= 0 || opened.length === this.#numUsableValves) {
      return 0;
    }

    const key = this.#cacheKeyOf(state);
    const cacheValue = this.#cacheGet(key);
    if (cacheValue !== null) {
      return cacheValue;
    }

    /**
     * List of all possible cases of actions that may be carried out during this minute.
     * Stored as tuple of additional pressure added and a state which would occur next minute.
     *
     * Cases (where n is the set of player tunnels, m is the set of elephant tunnels):
     *   - When n != m:
     *     - 1: Player opens valve, Elephant opens valve
     *     - n: Player goes down tunnel n, Elephant opens valve
     *     - m: Player opens valve, Elephant goes down tunnel m
     *     - n*m: Player goes down tunnel n, Elephant goes down tunnel m
     *   - When n == m:
     *     - n: Player goes down tunnel n, Elephant opens valve
     *     - n*m: Player goes down tunnel n, Elephant goes down tunnel m
     */
    const cases: [number, Omit<State, "remainingTime">][] = [];
    const nextMinute = remainingTime - 1;

    // check if case possible: Player opens valve, Elephant opens valve
    if (
      ePos !== pPos &&
      !opened.includes(ePos) &&
      !opened.includes(pPos) &&
      this.#valves[ePos].rate > 0 &&
      this.#valves[pPos].rate > 0
    ) {
      const pressure =
        this.#valves[pPos].rate * nextMinute +
        this.#valves[ePos].rate * nextMinute;

      cases.push([pressure, { pPos, ePos, opened: [...opened, ePos, pPos] }]);
    }

    // check if cases possible: Player goes down tunnel n, Elephant opens valve
    if (!opened.includes(ePos) && this.#valves[ePos].rate > 0) {
      const pressure = this.#valves[ePos].rate * nextMinute;
      const newOpened = [...opened, ePos];

      this.#valves[pPos].tunnels
        .map<typeof cases[0]>((tunnel) => [
          pressure,
          { pPos: tunnel, ePos, opened: newOpened, lastP: pPos },
        ])
        .filter(([, { pPos }]) => pPos !== lastP)
        .forEach((c) => cases.push(c));
    }

    // check if cases possible: Player opens valve, Elephant goes down tunnel m
    if (
      ePos !== pPos &&
      !opened.includes(pPos) &&
      this.#valves[pPos].rate > 0
    ) {
      const pressure = this.#valves[pPos].rate * nextMinute;
      const newOpened = [...opened, pPos];

      this.#valves[ePos].tunnels
        .map<typeof cases[0]>((tunnel) => [
          pressure,
          { pPos, ePos: tunnel, opened: newOpened, lastE: ePos },
        ])
        .filter(([, { ePos }]) => ePos !== lastE)
        .forEach((c) => cases.push(c));
    }

    // add remaining cases: Player goes down tunnel n, Elephant goes down tunnel m
    this.#valves[pPos].tunnels
      .map(
        (nextP) =>
          nextP !== lastP &&
          nextP !== lastE &&
          nextP !== ePos &&
          this.#valves[ePos].tunnels
            .map(
              (nextE) =>
                nextE !== lastE &&
                nextE !== lastP &&
                nextE !== pPos &&
                ({
                  pPos: nextP,
                  ePos: nextE,
                  opened,
                  lastP: pPos,
                  lastE: ePos,
                } as PartialState)
            )
            .filter((s): s is PartialState => !!s)
      )
      .filter((s): s is PartialState[] => !!s)
      .flat(1)
      .forEach((s) => cases.push([0, s]));

    const bestPath = max(
      cases.map(([pressure, state]) => {
        (state as State).remainingTime = nextMinute;
        return pressure + this.#bestPath(state as State);
      }),
      0
    );

    if (this.#debug > 1 && bestPath > this.#tentativeBest) {
      this.#tentativeBest = bestPath;
      console.log(
        "new best:",
        this.#tentativeBest,
        JSON.stringify({ remainingTime })
      );
    }

    this.#cacheSet(key, bestPath);
    return bestPath;
  };
}

const input = fs.readFileSync("day16.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const valves = parseValues(input);
  const pathfinder = new Pathfinder(valves, 26, "AA");
  result = pathfinder.solve(2);
}, true);

console.log(result);

export {};
