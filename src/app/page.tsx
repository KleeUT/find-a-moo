"use client";
import { useState, useEffect } from "react";
import style from "./page.module.css";
import seedrandom from "seedrandom";
type Cell = {
  used: boolean;
  clicked: boolean;
  letter: "m" | "o";
};

type Coordinate = {
  i: number;
  j: number;
};

const MooPage = () => {
  const [date, setDate] = useState(() => {
    return localStorage.getItem("date");
  });
  const [moos, setMoos] = useState(() => {
    const saved = localStorage.getItem("moos");
    if (saved) {
      return JSON.parse(saved) as Array<Array<Cell>>;
    }
    return generateMoos(15);
  });
  const [clicked, setClicked] = useState(() => {
    const saved = localStorage.getItem("clicked");
    if (saved) {
      return new Set<string>(JSON.parse(saved));
    }
    return new Set<string>();
  });
  const [foundMoos, setFoundMoos] = useState<Array<Coordinate>>(() => {
    const saved = localStorage.getItem("foundMoos");
    if (saved) {
      return JSON.parse(saved) as Array<Coordinate>;
    }
    return [];
  });
  useEffect(() => {
    localStorage.setItem("date", new Date().toDateString());
  }, [date]);

  useEffect(() => {
    console.log("saving foundMoos", foundMoos);
    localStorage.setItem("foundMoos", JSON.stringify(foundMoos));
  }, [foundMoos]);

  useEffect(() => {
    localStorage.setItem("moos", JSON.stringify(moos));
  }, [moos]);

  useEffect(() => {
    localStorage.setItem("clicked", JSON.stringify(Array.from(clicked.keys())));
  }, [clicked]);

  if (!date || date !== new Date().toDateString()) {
    setDate(new Date().toDateString());
    setMoos(generateMoos(15));
    setClicked(new Set());
    setFoundMoos([]);
  }

  function clearClicked() {
    for (const key of clicked) {
      const [i, j] = key.split("-").map(Number);
      moos[i][j].clicked = false;
    }
    setClicked(new Set());
  }

  function click(i: number, j: number) {
    if (clicked.has(`${i}-${j}`)) {
      clicked.delete(`${i}-${j}`);
      moos[i][j].clicked = false;
    } else {
      clicked.add(`${i}-${j}`);
      moos[i][j].clicked = true;
      setMoos([...moos]);
      if (clicked.size > 2) {
        if (isAMoo(clicked, foundMoos)) {
          const updatedFoundMoos = [
            ...foundMoos,
            ...Array.from(clicked.keys()).map((key) => {
              const [i, j] = key.split("-").map(Number);
              moos[i][j].used = true;
              return { i, j };
            }),
          ];
          console.log("found a moo!", updatedFoundMoos);
          setFoundMoos(updatedFoundMoos);
        } else {
          console.log("not a moo");
        }
        clearClicked();
        return;
      }
    }
    setClicked(new Set(clicked));
  }

  function isAMoo(clicked: Set<string>, foundMoos: Array<Coordinate>): boolean {
    // check if the clicked cells form an "MOO" pattern
    const positions = Array.from(clicked.keys())
      .map((key) => {
        const [i, j] = key.split("-").map(Number);
        return { i, j };
      })
      .sort((a, b) => a.i - b.i);

    // all positions must be in the same row, column or diagonal
    const iPositions = positions.map((pos) => pos.i);
    const jPositions = positions.map((pos) => pos.j);
    const within3i = Math.max(...iPositions) - Math.min(...iPositions) <= 2;
    const within3j = Math.max(...jPositions) - Math.min(...jPositions) <= 2;
    const allSameRow = positions.every((pos) => pos.i === positions[0].i);
    const allSameCol = positions.every((pos) => pos.j === positions[0].j);
    const allSameDiag1 = positions.every(
      (pos) => pos.i - pos.j === positions[0].i - positions[0].j,
    );
    const allSameDiag2 = positions.every(
      (pos) => pos.i + pos.j === positions[0].i + positions[0].j,
    );

    if (
      !(allSameRow || allSameCol || allSameDiag1 || allSameDiag2) ||
      !within3i ||
      !within3j
    ) {
      return false;
    }
    // at least one position must not be in found moos
    if (
      positions.every((pos) =>
        foundMoos.some((found) => found.i === pos.i && found.j === pos.j),
      )
    ) {
      return false;
    }

    // check if the letters form "MOO"
    const letters = positions.map((pos) => moos[pos.i][pos.j].letter).join("");
    return letters === "moo" || letters === "oom";
  }

  return (
    <main className={style.moo_main}>
      <h1>🐮 find-a-moo 🐮</h1>
      <div className={style.moo_board}>
        {moos.map((row, i) => (
          <div key={i} className={style.moo_row}>
            {row.map((cell, j) => (
              <button
                key={j}
                className={
                  style.moo_cell +
                  (cell.used ? ` ${style.moo_cell_used}` : "") +
                  (cell.clicked ? ` ${style.moo_cell_clicked}` : "")
                }
                onClick={() => click(i, j)}
              >
                {cell.letter}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={style.moo_results}>
        You&apos;ve found {foundMoos.length / 3} moo
        {foundMoos.length / 3 === 1 ? "" : "s"} on {date}
      </div>
      <div className={style.moo_controls}>
        <button
          className={style.moo_reset}
          onClick={() => {
            clearClicked();
            setFoundMoos([]);
            setMoos(generateMoos(15));
          }}
        >
          Reset
        </button>
      </div>
    </main>
  );
};

function generateMoos(dimension: number): Array<Array<Cell>> {
  // generate a date value consistent for today
  const today = new Date();
  const d =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const moos = new Array(dimension).fill(null).map((_1, i) => {
    return new Array(dimension).fill(null).map((_2, j) => ({
      used: false,
      clicked: false,
      letter: pick([i, j, d]),
    }));
  });
  return moos;
}

function pick(seeds: Array<number>): "m" | "o" {
  const random = seedrandom(seeds.join(""));
  return random() < 0.5 ? "m" : "o";
}

export default MooPage;
