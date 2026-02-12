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
  test("detects Four of a Kind with correct tie-break ordering", () => {
    const board = ["AS", "AD", "AH", "7S", "KC"];
    const players = [{ id: "p1", hole: ["AC", "2C"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Four of a Kind",
          chosen5: ["AS", "AD", "AH", "AC", "KC"]
        }
      }
    ]);
  });
  test("detects Straight Flush (incl. royal)", () => {
    const board = ["AS", "KS", "QS", "2D", "3C"];
    const players = [{ id: "p1", hole: ["JS", "TS"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Straight Flush",
          chosen5: ["AS", "KS", "QS", "JS", "TS"]
        }
      }
    ]);
  });
  test("selects best 5 cards out of 7 (board plays)", () => {
    const board = ["5S", "6D", "7H", "8C", "9S"];
    const players = [{ id: "p1", hole: ["2D", "KC"] }];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
    expect(result.players).toEqual([
      {
        id: "p1",
        best: {
          category: "Straight",
          chosen5: ["9S", "8C", "7H", "6D", "5S"]
        }
      }
    ]);
  });
  test("splits pot when best hands are equal", () => {
    const board = ["5S", "6D", "7H", "8C", "9S"];
    const players = [
      { id: "p1", hole: ["2D", "KC"] },
      { id: "p2", hole: ["AD", "QC"] }
    ];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1", "p2"]);
  });
  test("breaks ties within One Pair by kickers", () => {
    const board = ["AS", "KD", "7H", "4S", "2C"];
    const players = [
      { id: "p1", hole: ["7D", "QC"] },
      { id: "p2", hole: ["7C", "9D"] }
    ];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p1"]);
  });
  test("breaks ties within Two Pair by pairs then kicker", () => {
    const board = ["AS", "KD", "7H", "4S", "2C"];
    const players = [
      { id: "p1", hole: ["7D", "2D"] },
      { id: "p2", hole: ["7C", "4D"] }
    ];

    const result = evaluateGame(board, players);

    expect(result.winners).toEqual(["p2"]);
  });
});
