"use client";
export type Cell = {
  used: boolean;
  letter: "m" | "o";
  type: "normal" | "prefix";
};
