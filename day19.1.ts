const fs = require("fs");
const { benchmark, max } = require("./utils");

type Cost = [number, number, number];

interface Blueprint {
  id: number;
  ore: Cost;
  clay: Cost;
  obsidian: Cost;
  geode: Cost;
}

const parseBlueprints = (input: string): Blueprint[] =>
  input
    .split("\n")
    .filter((l) => l.length)
    .map((l) => l.trim())
    .map((l) => {
      const match = l.match(
        /Blueprint (?<id>[0-9]+): Each ore robot costs (?<ore>[0-9]+ [a-z]+)\. Each clay robot costs (?<clay>[0-9]+ [a-z]+)\. Each obsidian robot costs (?<obsidian>(( and )?[0-9]+ [a-z]+)+)\. Each geode robot costs (?<geode>(( and )?[0-9]+ [a-z]+)+)\./im
      );

      if (!match || !match.groups) {
        return undefined;
      }

      const { id, ore, clay, obsidian, geode } = match.groups;
      const [obsidian1, obsidian2] = obsidian.split(" and ");
      const [geode1, geode2] = geode.split(" and ");

      return {
        id: parseInt(id, 10),
        ore: [parseInt(ore.split(" ")[0], 10), 0, 0],
        clay: [parseInt(clay.split(" ")[0], 10), 0, 0],
        obsidian: [
          parseInt(obsidian1.split(" ")[0], 10),
          parseInt(obsidian2.split(" ")[0], 10),
          0,
        ],
        geode: [
          parseInt(geode1.split(" ")[0], 10),
          0,
          parseInt(geode2.split(" ")[0], 10),
        ],
      };
    })
    .filter((b): b is Blueprint => b !== undefined);

interface State {
  oreRobots: number;
  clayRobots: number;
  obsidianRobots: number;
  geodeRobots: number;
  ore: number;
  clay: number;
  obsidian: number;
  geode: number;
  remainingTime: number;
}

const initialState: State = {
  oreRobots: 1,
  clayRobots: 0,
  obsidianRobots: 0,
  geodeRobots: 0,
  ore: 0,
  clay: 0,
  obsidian: 0,
  geode: 0,
  remainingTime: 23,
};

let tests = 0;

const bestCase = (bp: Blueprint, state = { ...initialState }): number => {
  if (state.remainingTime <= 1) {
    return state.geode + state.geodeRobots;
  }

  state.remainingTime--;

  // apply last minute of collection
  state.ore += state.oreRobots;
  state.clay += state.clayRobots;
  state.obsidian += state.obsidianRobots;
  state.geode += state.geodeRobots;

  tests++;

  if (tests % 1_000_000 === 0) console.log(tests, state.remainingTime);

  const cases: State[] = [
    // case: no action
    { ...state },
    // case: build ore robot
    { ...state, oreRobots: state.oreRobots + 1, ore: state.ore - bp.ore[0] },
    // case: build clay robot
    { ...state, clayRobots: state.clayRobots + 1, ore: state.ore - bp.clay[0] },
    // case: build obsidian robot
    {
      ...state,
      obsidianRobots: state.obsidianRobots + 1,
      ore: state.ore - bp.obsidian[0],
      clay: state.clay - bp.obsidian[1],
    },
    // case: build geode robot
    {
      ...state,
      geodeRobots: state.geodeRobots + 1,
      ore: state.ore - bp.geode[0],
      obsidian: state.obsidian - bp.geode[2],
    },
  ].filter(
    ({ ore, clay, obsidian, geode }) =>
      ore >= state.oreRobots &&
      clay >= state.clayRobots &&
      obsidian >= state.obsidianRobots &&
      geode >= state.geodeRobots
  );

  const caseValues = cases.map((s) => bestCase(bp, s));

  return max(caseValues, 0);
};

const bestCaseBFS = (
  bp: Blueprint,
  test: (state: State) => boolean,
  startState: State = { ...initialState, remainingTime: 24 }
) => {
  const q: State[] = [{ ...startState }];

  while (q.length) {
    const state = q.shift()!;

    if (test(state)) {
      return state;
    }

    // apply last minute of collection
    state.remainingTime--;
    state.ore += state.oreRobots;
    state.clay += state.clayRobots;
    state.obsidian += state.obsidianRobots;
    state.geode += state.geodeRobots;

    const cases: State[] = [
      // case: no action
      { ...state },
      // case: build ore robot
      { ...state, oreRobots: state.oreRobots + 1, ore: state.ore - bp.ore[0] },
      // case: build clay robot
      {
        ...state,
        clayRobots: state.clayRobots + 1,
        ore: state.ore - bp.clay[0],
      },
      // case: build obsidian robot
      {
        ...state,
        obsidianRobots: state.obsidianRobots + 1,
        ore: state.ore - bp.obsidian[0],
        clay: state.clay - bp.obsidian[1],
      },
      // case: build geode robot
      {
        ...state,
        geodeRobots: state.geodeRobots + 1,
        ore: state.ore - bp.geode[0],
        obsidian: state.obsidian - bp.geode[2],
      },
    ].filter(
      ({ ore, clay, obsidian, geode }) =>
        ore >= state.oreRobots &&
        clay >= state.clayRobots &&
        obsidian >= state.obsidianRobots &&
        geode >= state.geodeRobots
    );

    q.push(...cases);
  }
};

const input = fs.readFileSync("day19.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const blueprints = parseBlueprints(input);
  const firstObsidian = bestCaseBFS(blueprints[0], (s) => s.obsidianRobots > 0);
  const firstGeode = bestCaseBFS(
    blueprints[0],
    (s) => s.geodeRobots > 0,
    firstObsidian
  );
  console.log(firstGeode);
  console.log(bestCase(blueprints[0], firstGeode));
}, true);

console.log(result);

export {};
