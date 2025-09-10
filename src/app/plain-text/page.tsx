import { generateMoos } from "../moo-generator";

export default function PlainTextPage() {
  const moos = generateMoos(15);
  return (
    <pre>
      {moos.map((row) => row.map((cell) => cell.letter).join(" ")).join("\n")}
    </pre>
  );
}
