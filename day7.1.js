const fs = require("fs");
const { benchmark, sum } = require("./utils");

// type KFileSize = number;
// type KFile = KFileSize;

// interface KDirectory {
//   parent?: KDirectory;
//   name: string;
//   size?: number;
//   contents: Record<string, KFileLike<any>>;
// }

// type KFileLike<FileType extends KFile | KDirectory> = FileType;

function* terminalIter(terminal = "") {
  // Yielded type:
  // {
  //   cmd: string;
  //   arg?: string;
  //   output: string[];
  // }

  for (const action of terminal.split("$")) {
    const [entry, ...output] = action.split("\n");
    const [cmd, arg] = entry.trim().split(" ");

    yield {
      cmd,
      arg,
      output: output.filter((line) => line.length > 0),
    };
  }
}

const parseLine = (line = "", parent) => {
  // Return type: [string, KFileLike] (JS entry)
  const [typeOrSize, name] = line.split(" ");

  if (typeOrSize === "dir") {
    return [
      name,
      {
        parent,
        name,
        contents: {},
      },
    ];
  } else {
    return [name, parseInt(typeOrSize, 10)];
  }
};

const parseFiles = (terminal = "") => {
  const files = {
    parent: undefined,
    name: "/",
    contents: {},
  };
  files.parent = files;
  let cwd = files;

  for (const { cmd, arg, output } of terminalIter(terminal)) {
    if (cmd === "cd" && arg === "/") {
      cwd = files;
    } else if (cmd === "cd" && arg === "..") {
      cwd = cwd.parent;
    } else if (cmd === "cd") {
      cwd = cwd.contents[arg];
    } else if (cmd === "ls") {
      cwd.contents = Object.fromEntries(
        output.map((line) => parseLine(line, cwd))
      );
    }
  }

  return files;
};

const computeSize = (files) => {
  const sizes = [];

  const getSize = (directory) => {
    directory.size = Object.values(directory.contents)
      .map((fileLike) =>
        typeof fileLike === "number" ? fileLike : getSize(fileLike)
      )
      .reduce(sum, 0);

    sizes.push(directory.size);
    return directory.size;
  };

  getSize(files);

  return sizes;
};

const input = fs.readFileSync("day7.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  const files = parseFiles(input);
  const sizes = computeSize(files);

  result = sizes.filter((size) => size <= 100000).reduce(sum);
});

console.log(result);
