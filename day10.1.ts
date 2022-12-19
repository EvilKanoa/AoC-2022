const fs = require("fs");
const { benchmark } = require("./utils");

interface MicroInstruction {
  type: "noop" | "add";
  arg?: number;
}

type Instruction = "noop" | `addx ${number}`;

type CPUState = number;

const decodeInstruction = (ins: Instruction): MicroInstruction[] => {
  if (ins === "noop") {
    return [{ type: "noop" }];
  }

  return [
    { type: "noop" },
    {
      type: "add",
      arg: parseInt(ins.split(" ")[1], 10),
    },
  ];
};

const decodeProgram = (program: string): MicroInstruction[] =>
  program
    .split("\n")
    .filter((line): line is Instruction => line.length > 0)
    .flatMap((line) => decodeInstruction(line));

const executeMicroInstruction = (
  register: CPUState,
  ins: MicroInstruction
): CPUState => {
  switch (ins.type) {
    case "noop":
      return register;
    case "add":
      return register + ins.arg!;
  }
};

const executeProgram = (
  program: MicroInstruction[],
  beforeCycle: (
    cycle: number,
    register: CPUState,
    instruction: MicroInstruction
  ) => void
): void => {
  let cycle = 1;
  let register = 1;

  for (const instruction of program) {
    beforeCycle(cycle++, register, instruction);
    register = executeMicroInstruction(register, instruction);
  }
};

const input = fs.readFileSync("day10.1.txt", { encoding: "utf-8" });

let result;

benchmark(() => {
  let signal = 0;

  executeProgram(decodeProgram(input), (cycle, register) => {
    if ((cycle - 20) % 40 === 0) {
      signal += cycle * register;
    }
  });

  result = signal;
});

console.log(result);
