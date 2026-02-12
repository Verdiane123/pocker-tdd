"use strict";

const RANKS = "23456789TJQKA";
const CATEGORY_RANK = {
  "High Card": 0,
  "One Pair": 1
};

function getRankValue(card) {
  return RANKS.indexOf(card[0]);
}

function sortByRankDesc(cards) {
  return cards.slice().sort((a, b) => getRankValue(b) - getRankValue(a));
}

function getRankCounts(cards) {
  const counts = new Map();
  for (const card of cards) {
    const value = getRankValue(card);
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

function evaluateOnePair(cards) {
  const counts = getRankCounts(cards);
  const pairRanks = Array.from(counts.entries())
    .filter((entry) => entry[1] >= 2)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  if (pairRanks.length === 0) {
    return null;
  }

  const ordered = sortByRankDesc(cards);
  const pairRank = pairRanks[0];
  const pairCards = ordered.filter((card) => getRankValue(card) === pairRank).slice(0, 2);
  const kickers = ordered.filter((card) => getRankValue(card) !== pairRank).slice(0, 3);

  return {
    category: "One Pair",
    chosen5: pairCards.concat(kickers)
  };
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

function compareOnePair(a, b) {
  const pairRankDiff = getRankValue(a.chosen5[0]) - getRankValue(b.chosen5[0]);
  if (pairRankDiff !== 0) {
    return pairRankDiff;
  }

  for (let i = 2; i < a.chosen5.length; i += 1) {
    const diff = getRankValue(a.chosen5[i]) - getRankValue(b.chosen5[i]);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function compareHands(a, b) {
  const categoryDiff = CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  if (a.category === "One Pair") {
    return compareOnePair(a, b);
  }

  return compareHighCard(a, b);
}

function evaluateGame(board, players) {
  const results = players.map((player) => {
    const allCards = board.concat(player.hole);
    const best = evaluateOnePair(allCards) || evaluateHighCard(allCards);
    return { id: player.id, best };
  });

  let bestSoFar = results[0].best;
  let winners = [results[0].id];

  for (let i = 1; i < results.length; i += 1) {
    const current = results[i].best;
    const diff = compareHands(current, bestSoFar);
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
