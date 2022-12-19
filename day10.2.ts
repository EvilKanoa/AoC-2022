const fs = require("fs");
const { benchmark } = require("./utils");

interface MicroInstruction {
  type: "noop" | "add";
  arg?: number;
}

type Instruction = "noop" | `addx ${number}`;

type Display = boolean[][];

type CPUState = number;

type CycleHookFn = (
  cycle: number,
  register: CPUState,
  instruction: MicroInstruction
) => void;

const noopFn = () => {};

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
  beforeCycle: CycleHookFn = noopFn,
  afterCycle: CycleHookFn = noopFn
): void => {
  let cycle = 1;
  let register = 1;

  for (const instruction of program) {
    beforeCycle(cycle, register, instruction);
    register = executeMicroInstruction(register, instruction);
    afterCycle(cycle++, register, instruction);
  }
};

const createDisplay = (): Display =>
  new Array(40).fill(undefined).map(() => new Array(6).fill(false));

const attachGPU =
  (display: Display): CycleHookFn =>
  (cycle, register) => {
    const [x, y] = [(cycle - 1) % 40, Math.floor((cycle - 1) / 40)];

    display[x][y] = Math.abs(register - x) <= 1;
  };

const printDisplay = (display: Display): void => {
  for (let y = 0; y < 6; y++) {
    console.log(
      display
        .map((column) => column[y])
        .map((value) => (value ? "#" : "."))
        .join("")
    );
  }
};

const input = fs.readFileSync("day10.1.txt", { encoding: "utf-8" });

let result: Display;

benchmark(() => {
  const display = createDisplay();
  executeProgram(decodeProgram(input), attachGPU(display));

  result = display;
});

printDisplay(result!);
