const { execFileSync } = require("child_process");
const fs = require("fs");

const files = fs.readdirSync(".");

// filter to only solution files
const solutions = files.filter((filename) => {
  if (fs.statSync(filename).isDirectory()) {
    return false;
  }

  return !!filename.match(/day[0-9]+.[12].js/gi);
});

// execute each solution
solutions.forEach((filename) => {
  console.log(`Executing "${filename}"...`);
  console.log(execFileSync("node", [filename]).toString());
});
