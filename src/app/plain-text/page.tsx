"use client";
import { generateMoos } from "../moo-generator";

function customSize(): number {
  if (typeof window !== "undefined") {
    // get the width from the query parameter size;
    const params = new URLSearchParams(window.location.search);
    const size = params.get("size");
    if (size) {
      const n = parseInt(size);
      return Math.min(Math.max(n, 5), 30);
    }
  }
  return 15;
}

export default function PlainTextPage() {
  const moos = generateMoos(customSize());
  return (
    <pre>
      {moos.map((row) => row.map((cell) => cell.letter).join(" ")).join("\n")}
    </pre>
  );
}
