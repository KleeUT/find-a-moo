import seedrandom from "seedrandom";
import { Cell } from "./Cell";
const moo: Array<"m" | "o"> = ["m", "o", "o"];
function generateMoos(dimension: number): Array<Array<Cell>> {
  // generate a date value consistent for today
  const today = new Date();
  const d =
    dimension +
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const moos = new Array(dimension).fill(null).map((_1, i) => {
    return new Array(dimension).fill(null).map(
      (_2, j) =>
        ({
          used: false,
          clicked: false,
          letter: pick([i, j, d]),
          type: "normal",
        } as Cell),
    );
  });
  return moos;
}

function pick(seeds: Array<number>): "m" | "o" {
  const random = seedrandom(seeds.join(""));
  return moo[Math.floor(random() * 3)];
}
export { generateMoos };
