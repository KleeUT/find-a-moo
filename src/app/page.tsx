"use client";
import { useState, useEffect } from "react";
import style from "./page.module.css";
import { generateMoos } from "./moo-generator";
import { Cell } from "./Cell";
import { boardSizes } from "./sizes";
import { colPrefixes, rowPrefixes } from "./constants";
type Coordinate = {
  i: number;
  j: number;
};

type GameData = {
  date: string;
  currentSize: number;
  mooData: {
    [size: number]: {
      moos: Array<Array<Cell>>;
      foundMoos: Array<Coordinate>;
    };
  };
};

function windowLocalStorage(): Storage | null {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
}

const MooPage = () => {
  const [clicked, setClicked] = useState<Set<string>>(new Set<string>());
  const [gameState, setGameState] = useState<GameData>(() => {
    const storedGateState = windowLocalStorage()?.getItem("gameState");
    if (storedGateState) {
      return JSON.parse(storedGateState) as GameData;
    }

    return {
      date: new Date().toDateString(),
      currentSize: boardSizes.maxi,
      mooData: {
        [boardSizes.maxi]: {
          moos: generateMoos(boardSizes.maxi),
          foundMoos: [],
        },
      },
    };
  });

  useEffect(() => {
    console.log("UPdating state");
    windowLocalStorage()?.setItem("gameState", JSON.stringify(gameState));
  }, [gameState]);

  if (!gameState || gameState.date !== new Date().toDateString()) {
    console.log("New day, generating new moos");
    resetGame();
  }

  function clearClicked() {
    setClicked(new Set<string>());
  }
  function resetGame() {
    setGameState({
      date: new Date().toDateString(),
      currentSize: gameState.currentSize,
      mooData: {
        [gameState.currentSize]: {
          moos: generateMoos(gameState.currentSize),
          foundMoos: [],
        },
      },
    });
  }

  function setSize(size: number) {
    if (size === gameState.currentSize) {
      return;
    }
    if (gameState.mooData[size]) {
      setGameState((prevState) => ({
        ...prevState,
        currentSize: size,
      }));
      return;
    } else {
      setGameState((prevState) => ({
        ...prevState,
        currentSize: size,
        mooData: {
          ...prevState.mooData,
          [size]: {
            moos: generateMoos(size),
            foundMoos: [],
          },
        },
      }));
    }
  }

  function click(i: number, j: number) {
    const moos = gameState.mooData[gameState.currentSize]?.moos;
    let foundMoos = gameState.mooData[gameState.currentSize]?.foundMoos || [];
    if (clicked.has(`${i}-${j}`)) {
      clicked.delete(`${i}-${j}`);
    } else {
      clicked.add(`${i}-${j}`);
      if (clicked.size > 2) {
        if (isAMoo(clicked, foundMoos)) {
          foundMoos = [
            ...foundMoos,
            ...Array.from(clicked.keys()).map((key) => {
              const [i, j] = key.split("-").map(Number);
              moos[i][j].used = true;
              return { i, j };
            }),
          ];
          console.log("found a moo!", foundMoos);
        } else {
          console.log("not a moo");
        }
        clearClicked();
      }
    }
    setGameState({
      ...gameState,
      mooData: {
        ...gameState.mooData,
        [gameState.currentSize]: {
          ...gameState.mooData[gameState.currentSize],
          moos,
          foundMoos,
        },
      },
    });
  }

  function isAMoo(clicked: Set<string>, foundMoos: Array<Coordinate>): boolean {
    const moos = gameState.mooData[gameState.currentSize]?.moos;
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

  const columnPrefixesForSize = [
    "",
    ...colPrefixes.slice(0, gameState.currentSize + 1),
    "",
  ];
  const rowPrefixesForSize = rowPrefixes.slice(0, gameState.currentSize);
  const moos = gameState.mooData[gameState.currentSize]?.moos.map((x, i) => {
    return [
      {
        type: "prefix",
        letter: rowPrefixesForSize[i],
        used: false,
      },
      ...x,
      {
        type: "prefix",
        letter: rowPrefixesForSize[i],
        used: false,
      },
    ];
  });
  const foundMoos = gameState.mooData[gameState.currentSize]?.foundMoos || [];
  const date = gameState.date || new Date().toDateString();
  return (
    <main className={style.moo_main}>
      <h1>🐮 find-a-moo 🐮</h1>
      <div className={style.moo_size_buttons}>
        <button
          onClick={() => setSize(boardSizes.micro)}
          className={
            style.moo_button +
            " " +
            (gameState.currentSize === boardSizes.micro
              ? style.moo_button_selected
              : "")
          }
        >
          Micro Moo
        </button>
        <button
          onClick={() => setSize(boardSizes.mini)}
          className={
            style.moo_button +
            " " +
            (gameState.currentSize === boardSizes.mini
              ? style.moo_button_selected
              : "")
          }
        >
          Mini Moo
        </button>
        <button
          onClick={() => setSize(boardSizes.maxi)}
          className={
            style.moo_button +
            " " +
            (gameState.currentSize === boardSizes.maxi
              ? style.moo_button_selected
              : "")
          }
        >
          Maxi Moo
        </button>
      </div>
      <div className={style.moo_board}>
        <div className={style.moo_row}>
          {columnPrefixesForSize.map((col, j) => (
            <div key={col} className={style.moo_column_prefix}>
              {col}
            </div>
          ))}
        </div>
        {moos.map((row, i) => (
          <div key={i} className={style.moo_row}>
            {row.map((cell, j) =>
              cell.type === "prefix" ? (
                <div className={style.moo_row_prefix} key={cell.letter}>
                  {cell.letter}
                </div>
              ) : (
                <button
                  key={j}
                  className={
                    style.moo_cell +
                    (cell.used ? ` ${style.moo_cell_used}` : "") +
                    (clicked.has(`${i}-${j - 1}`)
                      ? ` ${style.moo_cell_clicked}`
                      : "") +
                    (cell.type === "prefix" ? ` ${style.moo_row_prefix}` : "")
                  }
                  onClick={() => click(i, j - 1)}
                >
                  {cell.letter}
                </button>
              ),
            )}
          </div>
        ))}
        <div className={style.moo_row}>
          {columnPrefixesForSize.map((col, j) => (
            <div key={col} className={style.moo_column_prefix}>
              {col}
            </div>
          ))}
        </div>
      </div>
      <div className={style.moo_results}>
        You&apos;ve found {foundMoos.length / 3} moo
        {foundMoos.length / 3 === 1 ? "" : "s"} on {date}
      </div>
      <div className={style.moo_controls}>
        <button
          className={style.moo_button + " " + style.moo_share}
          onClick={() => {
            const url = new URL(window.location.href);
            window.navigator.share({
              url: url.toString(),
              title: `find-a-moo ${date}`,
              text: `I found ${foundMoos.length / 3} moo${
                foundMoos.length / 3 === 1 ? "" : "s"
              } on ${date} - can you find more? #findamoo #makestupidapps`,
            });
          }}
        >
          Share
        </button>
        <button
          className={style.moo_button + " " + style.moo_reset}
          onClick={() => {
            clearClicked();
            resetGame();
          }}
        >
          Reset
        </button>
      </div>
    </main>
  );
};

export default MooPage;
