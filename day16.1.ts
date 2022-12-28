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
    .split("\n") //banana split
    .filter((line) => line.length > 0) //water filter
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

const asCSV = (valves: ValveTable) =>
  Object.values(valves)
    .map(({ valve, rate, tunnels }) => `${valve},${rate},${tunnels.join(";")}`)
    .join("\n");

const cacheKey = (
  from: string,
  remainingTime: number,
  opened: Set<string>,
  lastFrom: string | undefined
): string =>
  `${from},${remainingTime},${[...opened].sort().join(",")},${lastFrom}`;

const bestPath = (
  valves: ValveTable,
  from: string,
  remainingTime: number,
  opened: Set<string>,
  lastFrom: string | undefined = undefined,
  cache: Record<string, number> = {}
): number => {
  if (remainingTime <= 0) {
    return 0;
  }

  // caching/memoizing this was the key optimization to make this possible
  const key = cacheKey(from, remainingTime, opened, lastFrom);
  if (key in cache) {
    return cache[key];
  }

  const fromOpened = new Set(opened);
  fromOpened.add(from);

  const paths = (
    remainingTime > 1 && valves[from].rate > 0 ? [opened, fromOpened] : [opened]
  )
    .map((opened) =>
      valves[from].tunnels.map<[Set<string>, string]>((tunnel) => [
        opened,
        tunnel,
      ])
    )
    .flat(1)
    .map(([myOpened, tunnel]) => {
      let pressure = 0;
      let time = remainingTime;

      if (myOpened.has(from) && !opened.has(from)) {
        time--;
        pressure += valves[from].rate * time;
      } else if (tunnel === lastFrom) {
        // shoutout to Ethan from this optimization:
        // no need to go back down a tunnel you just came from if you're not opening a valve here
        return undefined;
      }

      return pressure + bestPath(valves, tunnel, time - 1, myOpened, from, cache);
    })
    .filter((x): x is number => x !== undefined);

  const result = max(paths, 0);
  cache[key] = result;
  return result;
};

const input = fs.readFileSync("day16.1.txt", { encoding: "utf-8" }) as string;

let result;

benchmark(() => {
  const valves = parseValues(input);
  result = bestPath(valves, "AA", 30, new Set());
}, true);

console.log(result);
