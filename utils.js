const utils = {
  sum: (val, acc) => val + acc,
  benchmark: (execute, once = false) => {
    const runs = [];
    const count = once === true ? 1 : typeof once === "number" ? once : 10;

    for (let i = 0; i < count; i++) {
      const start = performance.now();
      execute();
      const end = performance.now();

      runs.push(end - start);
    }

    const average = runs.reduce(utils.sum) / runs.length;
    console.log(`Average execution over ${count} runs: ${average} ms`);
  },
  min: (numbers = []) => {
    let minimum = Number.MAX_SAFE_INTEGER;
    for (const num of numbers) {
      minimum = num < minimum ? num : minimum;
    }
    return minimum;
  },
  max: (numbers = []) => {
    let maximum = Number.MIN_SAFE_INTEGER;
    for (const num of numbers) {
      maximum = num > maximum ? num : maximum;
    }
    return maximum;
  },
  mod: (n, d) => ((n % d) + d) % d,
};

module.exports = utils;
