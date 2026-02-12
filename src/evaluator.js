"use strict";

const RANKS = "23456789TJQKA";

function getRankValue(card) {
  return RANKS.indexOf(card[0]);
}

function sortByRankDesc(cards) {
  return cards.slice().sort((a, b) => getRankValue(b) - getRankValue(a));
}

function evaluateHighCard(cards) {
  const ordered = sortByRankDesc(cards);
  return {
    category: "High Card",
    chosen5: ordered.slice(0, 5)
  };
}

function compareHighCard(a, b) {
  for (let i = 0; i < a.chosen5.length; i += 1) {
    const diff = getRankValue(a.chosen5[i]) - getRankValue(b.chosen5[i]);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function evaluateGame(board, players) {
  const results = players.map((player) => {
    const allCards = board.concat(player.hole);
    const best = evaluateHighCard(allCards);
    return { id: player.id, best };
  });

  let bestSoFar = results[0].best;
  let winners = [results[0].id];

  for (let i = 1; i < results.length; i += 1) {
    const current = results[i].best;
    const diff = compareHighCard(current, bestSoFar);
    if (diff > 0) {
      bestSoFar = current;
      winners = [results[i].id];
    } else if (diff === 0) {
      winners.push(results[i].id);
    }
  }

  return {
    winners,
    players: results
  };
}

module.exports = {
  evaluateGame
};
