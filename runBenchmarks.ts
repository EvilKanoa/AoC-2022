const { execFileSync } = require("child_process");
const fs = require("fs");

const files = fs.readdirSync(".") as string[];

// filter to only solution files
const solutions = files
  .filter((filename) => {
    if (fs.statSync(filename).isDirectory()) {
      return false;
    }

    return !!filename.match(/day[0-9]+.[12].[jt]s/gi);
  })
  .sort(
    (a, b) =>
      parseInt(a.slice(3, a.indexOf("."))) -
      parseInt(b.slice(3, b.indexOf(".")))
  );

// execute each solution
solutions.forEach((filename) => {
  console.log(`Executing "${filename}"...`);
  console.log(execFileSync("ts-node", [filename]).toString());
});
