"use strict";

const { evaluateGame } = require("../src/evaluator");

describe("Texas Hold'em hand evaluation", () => {
  test("detects High Card and orders chosen5 correctly", () => {
    const board = ["AS", "KD", "7H", "4S", "2C"];
    const players = [{ id: "p1", hole: ["9D", "3C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "High Card",
          chosen5: ["AS", "KD", "9D", "7H", "4S"]
        }
      }
    ]);
  });
  test("detects One Pair with correct tie-break ordering", () => {
    const board = ["AS", "KD", "7H", "4S", "2C"];
    const players = [{ id: "p1", hole: ["7D", "3C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "One Pair",
          chosen5: ["7H", "7D", "AS", "KD", "4S"]
        }
      }
    ]);
  });
  test.todo("detects Two Pair with correct tie-break ordering");
  test.todo("detects Three of a Kind with correct tie-break ordering");
  test.todo("detects Straight including wheel (A-2-3-4-5)");
  test.todo("detects Flush and orders chosen5 correctly");
  test.todo("detects Full House with correct tie-break ordering");
  test.todo("detects Four of a Kind with correct tie-break ordering");
  test.todo("detects Straight Flush (incl. royal)");
  test.todo("selects best 5 cards out of 7 (board plays)");
  test.todo("splits pot when best hands are equal");
});
