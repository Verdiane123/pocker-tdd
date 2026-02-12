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
  test("detects Two Pair with correct tie-break ordering", () => {
    const board = ["AS", "KD", "7H", "4S", "2C"];
    const players = [{ id: "p1", hole: ["7D", "2D"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Two Pair",
          chosen5: ["7H", "7D", "2C", "2D", "AS"]
        }
      }
    ]);
  });
  test("detects Three of a Kind with correct tie-break ordering", () => {
    const board = ["AS", "KD", "7H", "4S", "2C"];
    const players = [{ id: "p1", hole: ["7D", "7C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Three of a Kind",
          chosen5: ["7H", "7D", "7C", "AS", "KD"]
        }
      }
    ]);
  });
  test("detects Straight including wheel (A-2-3-4-5)", () => {
    const board = ["AS", "2D", "3H", "9S", "KC"];
    const players = [{ id: "p1", hole: ["4D", "5C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Straight",
          chosen5: ["5C", "4D", "3H", "2D", "AS"]
        }
      }
    ]);
  });
  test("detects Flush and orders chosen5 correctly", () => {
    const board = ["AS", "QS", "9S", "2S", "KC"];
    const players = [{ id: "p1", hole: ["7S", "3C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Flush",
          chosen5: ["AS", "QS", "9S", "7S", "2S"]
        }
      }
    ]);
  });
  test("detects Full House with correct tie-break ordering", () => {
    const board = ["AS", "AD", "7H", "7S", "KC"];
    const players = [{ id: "p1", hole: ["7D", "2C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Full House",
          chosen5: ["7H", "7S", "7D", "AS", "AD"]
        }
      }
    ]);
  });
  test.todo("detects Four of a Kind with correct tie-break ordering");
  test.todo("detects Straight Flush (incl. royal)");
  test.todo("selects best 5 cards out of 7 (board plays)");
  test.todo("splits pot when best hands are equal");
});
