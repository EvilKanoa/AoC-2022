const utils = {
  sum: (val, acc) => val + acc,
  benchmark: (execute) => {
    const runs = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      const start = performance.now();
      execute();
      const end = performance.now();

      runs.push(end - start);
    }

    const average = runs.reduce(utils.sum) / runs.length;
    console.log(`Average execution over ${count} runs: ${average} ms`);
  },
};

module.exports = utils;
