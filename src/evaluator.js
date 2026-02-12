"use strict";

const RANKS = "23456789TJQKA";
const CATEGORY_RANK = {
  "High Card": 0,
  "One Pair": 1,
  "Two Pair": 2,
  "Three of a Kind": 3,
  "Straight": 4,
  "Flush": 5,
  "Full House": 6,
  "Four of a Kind": 7
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

function evaluateTwoPair(cards) {
  const counts = getRankCounts(cards);
  const pairRanks = Array.from(counts.entries())
    .filter((entry) => entry[1] >= 2)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  if (pairRanks.length < 2) {
    return null;
  }

  const ordered = sortByRankDesc(cards);
  const highPairRank = pairRanks[0];
  const lowPairRank = pairRanks[1];
  const highPair = ordered.filter((card) => getRankValue(card) === highPairRank).slice(0, 2);
  const lowPair = ordered.filter((card) => getRankValue(card) === lowPairRank).slice(0, 2);
  const kicker = ordered.filter((card) => {
    const rank = getRankValue(card);
    return rank !== highPairRank && rank !== lowPairRank;
  })[0];

  return {
    category: "Two Pair",
    chosen5: highPair.concat(lowPair, [kicker])
  };
}

function evaluateThreeOfAKind(cards) {
  const counts = getRankCounts(cards);
  const tripRanks = Array.from(counts.entries())
    .filter((entry) => entry[1] >= 3)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  if (tripRanks.length === 0) {
    return null;
  }

  const ordered = sortByRankDesc(cards);
  const tripRank = tripRanks[0];
  const tripCards = ordered.filter((card) => getRankValue(card) === tripRank).slice(0, 3);
  const kickers = ordered.filter((card) => getRankValue(card) !== tripRank).slice(0, 2);

  return {
    category: "Three of a Kind",
    chosen5: tripCards.concat(kickers)
  };
}

function getUniqueRanksDesc(cards) {
  const unique = new Set(cards.map((card) => getRankValue(card)));
  return Array.from(unique).sort((a, b) => b - a);
}

function buildStraightFromHigh(highRank, cards) {
  const ordered = sortByRankDesc(cards);
  const needed = [highRank, highRank - 1, highRank - 2, highRank - 3, highRank - 4];
  return needed.map((rank) => ordered.find((card) => getRankValue(card) === rank));
}

function evaluateStraight(cards) {
  const uniqueRanks = getUniqueRanksDesc(cards);
  const hasAce = uniqueRanks.includes(RANKS.indexOf("A"));

  for (let i = 0; i <= uniqueRanks.length - 5; i += 1) {
    const start = uniqueRanks[i];
    const run = [start, start - 1, start - 2, start - 3, start - 4];
    const isStraight = run.every((rank) => uniqueRanks.includes(rank));
    if (isStraight) {
      return {
        category: "Straight",
        chosen5: buildStraightFromHigh(start, cards)
      };
    }
  }

  if (hasAce) {
    const wheelRanks = [3, 2, 1, 0];
    const hasWheel = wheelRanks.every((rank) => uniqueRanks.includes(rank));
    if (hasWheel) {
      const ordered = sortByRankDesc(cards);
      const needed = [3, 2, 1, 0, RANKS.indexOf("A")];
      return {
        category: "Straight",
        chosen5: needed.map((rank) => ordered.find((card) => getRankValue(card) === rank))
      };
    }
  }

  return null;
}

function getSuitGroups(cards) {
  const groups = new Map();
  for (const card of cards) {
    const suit = card[1];
    const list = groups.get(suit) || [];
    list.push(card);
    groups.set(suit, list);
  }
  return groups;
}

function evaluateFlush(cards) {
  const groups = getSuitGroups(cards);
  for (const suitedCards of groups.values()) {
    if (suitedCards.length >= 5) {
      const ordered = sortByRankDesc(suitedCards);
      return {
        category: "Flush",
        chosen5: ordered.slice(0, 5)
      };
    }
  }
  return null;
}

function evaluateFullHouse(cards) {
  const counts = getRankCounts(cards);
  const trips = Array.from(counts.entries())
    .filter((entry) => entry[1] >= 3)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  if (trips.length === 0) {
    return null;
  }

  const remainingPairs = Array.from(counts.entries())
    .filter((entry) => entry[0] !== trips[0] && entry[1] >= 2)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  if (remainingPairs.length === 0) {
    if (trips.length < 2) {
      return null;
    }
    remainingPairs.push(trips[1]);
  }

  const ordered = sortByRankDesc(cards);
  const tripRank = trips[0];
  const pairRank = remainingPairs[0];
  const tripCards = ordered.filter((card) => getRankValue(card) === tripRank).slice(0, 3);
  const pairCards = ordered.filter((card) => getRankValue(card) === pairRank).slice(0, 2);

  return {
    category: "Full House",
    chosen5: tripCards.concat(pairCards)
  };
}

function evaluateFourOfAKind(cards) {
  const counts = getRankCounts(cards);
  const quadRanks = Array.from(counts.entries())
    .filter((entry) => entry[1] >= 4)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  if (quadRanks.length === 0) {
    return null;
  }

  const ordered = sortByRankDesc(cards);
  const quadRank = quadRanks[0];
  const quadCards = ordered.filter((card) => getRankValue(card) === quadRank).slice(0, 4);
  const kicker = ordered.filter((card) => getRankValue(card) !== quadRank)[0];

  return {
    category: "Four of a Kind",
    chosen5: quadCards.concat([kicker])
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

function compareTwoPair(a, b) {
  const highPairDiff = getRankValue(a.chosen5[0]) - getRankValue(b.chosen5[0]);
  if (highPairDiff !== 0) {
    return highPairDiff;
  }

  const lowPairDiff = getRankValue(a.chosen5[2]) - getRankValue(b.chosen5[2]);
  if (lowPairDiff !== 0) {
    return lowPairDiff;
  }

  return getRankValue(a.chosen5[4]) - getRankValue(b.chosen5[4]);
}

function compareThreeOfAKind(a, b) {
  const tripDiff = getRankValue(a.chosen5[0]) - getRankValue(b.chosen5[0]);
  if (tripDiff !== 0) {
    return tripDiff;
  }

  for (let i = 3; i < a.chosen5.length; i += 1) {
    const diff = getRankValue(a.chosen5[i]) - getRankValue(b.chosen5[i]);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function compareStraight(a, b) {
  return getRankValue(a.chosen5[0]) - getRankValue(b.chosen5[0]);
}

function compareFlush(a, b) {
  for (let i = 0; i < a.chosen5.length; i += 1) {
    const diff = getRankValue(a.chosen5[i]) - getRankValue(b.chosen5[i]);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function compareFullHouse(a, b) {
  const tripDiff = getRankValue(a.chosen5[0]) - getRankValue(b.chosen5[0]);
  if (tripDiff !== 0) {
    return tripDiff;
  }
  return getRankValue(a.chosen5[3]) - getRankValue(b.chosen5[3]);
}

function compareFourOfAKind(a, b) {
  const quadDiff = getRankValue(a.chosen5[0]) - getRankValue(b.chosen5[0]);
  if (quadDiff !== 0) {
    return quadDiff;
  }
  return getRankValue(a.chosen5[4]) - getRankValue(b.chosen5[4]);
}

function compareHands(a, b) {
  const categoryDiff = CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  if (a.category === "Four of a Kind") {
    return compareFourOfAKind(a, b);
  }

  if (a.category === "Full House") {
    return compareFullHouse(a, b);
  }

  if (a.category === "Flush") {
    return compareFlush(a, b);
  }

  if (a.category === "Straight") {
    return compareStraight(a, b);
  }

  if (a.category === "Three of a Kind") {
    return compareThreeOfAKind(a, b);
  }

  if (a.category === "Two Pair") {
    return compareTwoPair(a, b);
  }

  if (a.category === "One Pair") {
    return compareOnePair(a, b);
  }

  return compareHighCard(a, b);
}

function evaluateGame(board, players) {
  const results = players.map((player) => {
    const allCards = board.concat(player.hole);
    const best =
      evaluateFourOfAKind(allCards) ||
      evaluateFullHouse(allCards) ||
      evaluateFlush(allCards) ||
      evaluateStraight(allCards) ||
      evaluateThreeOfAKind(allCards) ||
      evaluateTwoPair(allCards) ||
      evaluateOnePair(allCards) ||
      evaluateHighCard(allCards);
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
