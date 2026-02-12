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
  "Four of a Kind": 7,
  "Straight Flush": 8
};

const EVALUATORS = [
  evaluateStraightFlush,
  evaluateFourOfAKind,
  evaluateFullHouse,
  evaluateFlush,
  evaluateStraight,
  evaluateThreeOfAKind,
  evaluateTwoPair,
  evaluateOnePair,
  evaluateHighCard
];

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

function getRanksByCount(counts, minCount) {
  return Array.from(counts.entries())
    .filter((entry) => entry[1] >= minCount)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);
}

function getCardsOfRank(cards, rankValue, limit) {
  return sortByRankDesc(cards)
    .filter((card) => getRankValue(card) === rankValue)
    .slice(0, limit);
}

function getCardsExcludingRanks(cards, excludedRanks, limit) {
  return sortByRankDesc(cards)
    .filter((card) => !excludedRanks.includes(getRankValue(card)))
    .slice(0, limit);
}

function evaluateOnePair(cards) {
  const counts = getRankCounts(cards);
  const pairRanks = getRanksByCount(counts, 2);

  if (pairRanks.length === 0) {
    return null;
  }

  const pairRank = pairRanks[0];
  const pairCards = getCardsOfRank(cards, pairRank, 2);
  const kickers = getCardsExcludingRanks(cards, [pairRank], 3);

  return {
    category: "One Pair",
    chosen5: pairCards.concat(kickers)
  };
}

function evaluateTwoPair(cards) {
  const counts = getRankCounts(cards);
  const pairRanks = getRanksByCount(counts, 2);

  if (pairRanks.length < 2) {
    return null;
  }

  const highPairRank = pairRanks[0];
  const lowPairRank = pairRanks[1];
  const highPair = getCardsOfRank(cards, highPairRank, 2);
  const lowPair = getCardsOfRank(cards, lowPairRank, 2);
  const kicker = getCardsExcludingRanks(cards, [highPairRank, lowPairRank], 1);

  return {
    category: "Two Pair",
    chosen5: highPair.concat(lowPair, kicker)
  };
}

function evaluateThreeOfAKind(cards) {
  const counts = getRankCounts(cards);
  const tripRanks = getRanksByCount(counts, 3);

  if (tripRanks.length === 0) {
    return null;
  }

  const tripRank = tripRanks[0];
  const tripCards = getCardsOfRank(cards, tripRank, 3);
  const kickers = getCardsExcludingRanks(cards, [tripRank], 2);

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

function evaluateStraightFlush(cards) {
  const groups = getSuitGroups(cards);
  for (const suitedCards of groups.values()) {
    if (suitedCards.length >= 5) {
      const straight = evaluateStraight(suitedCards);
      if (straight) {
        return {
          category: "Straight Flush",
          chosen5: straight.chosen5
        };
      }
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
  const trips = getRanksByCount(counts, 3);

  if (trips.length === 0) {
    return null;
  }

  const tripRank = trips[0];
  const pairsExcludingTrip = Array.from(counts.entries())
    .filter((entry) => entry[0] !== tripRank && entry[1] >= 2)
    .map((entry) => entry[0])
    .sort((a, b) => b - a);

  const pairRank = pairsExcludingTrip.length > 0 ? pairsExcludingTrip[0] : (trips[1] || null);
  if (!pairRank) {
    return null;
  }

  const tripCards = getCardsOfRank(cards, tripRank, 3);
  const pairCards = getCardsOfRank(cards, pairRank, 2);

  return {
    category: "Full House",
    chosen5: tripCards.concat(pairCards)
  };
}

function evaluateFourOfAKind(cards) {
  const counts = getRankCounts(cards);
  const quadRanks = getRanksByCount(counts, 4);

  if (quadRanks.length === 0) {
    return null;
  }

  const quadRank = quadRanks[0];
  const quadCards = getCardsOfRank(cards, quadRank, 4);
  const kicker = getCardsExcludingRanks(cards, [quadRank], 1);

  return {
    category: "Four of a Kind",
    chosen5: quadCards.concat(kicker)
  };
}

function evaluateHighCard(cards) {
  const ordered = sortByRankDesc(cards);
  return {
    category: "High Card",
    chosen5: ordered.slice(0, 5)
  };
}

function compareByCards(aCards, bCards, startIndex) {
  for (let i = startIndex; i < aCards.length; i += 1) {
    const diff = getRankValue(aCards[i]) - getRankValue(bCards[i]);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function compareByIndices(aCards, bCards, indices) {
  for (const index of indices) {
    const diff = getRankValue(aCards[index]) - getRankValue(bCards[index]);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function compareOnePair(a, b) {
  const pairRankDiff = compareByIndices(a.chosen5, b.chosen5, [0]);
  if (pairRankDiff !== 0) {
    return pairRankDiff;
  }
  return compareByCards(a.chosen5, b.chosen5, 2);
}

function compareTwoPair(a, b) {
  return compareByIndices(a.chosen5, b.chosen5, [0, 2, 4]);
}

function compareThreeOfAKind(a, b) {
  const tripDiff = compareByIndices(a.chosen5, b.chosen5, [0]);
  if (tripDiff !== 0) {
    return tripDiff;
  }
  return compareByCards(a.chosen5, b.chosen5, 3);
}

function compareStraight(a, b) {
  return compareByIndices(a.chosen5, b.chosen5, [0]);
}

function compareFlush(a, b) {
  return compareByCards(a.chosen5, b.chosen5, 0);
}

function compareFullHouse(a, b) {
  return compareByIndices(a.chosen5, b.chosen5, [0, 3]);
}

function compareFourOfAKind(a, b) {
  return compareByIndices(a.chosen5, b.chosen5, [0, 4]);
}

const COMPARATORS = {
  "Straight Flush": compareStraight,
  "Four of a Kind": compareFourOfAKind,
  "Full House": compareFullHouse,
  "Flush": compareFlush,
  "Straight": compareStraight,
  "Three of a Kind": compareThreeOfAKind,
  "Two Pair": compareTwoPair,
  "One Pair": compareOnePair
};

function compareHands(a, b) {
  const categoryDiff = CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
  if (categoryDiff !== 0) {
    return categoryDiff;
  }

  const comparator = COMPARATORS[a.category] || ((hand1, hand2) => compareByCards(hand1.chosen5, hand2.chosen5, 0));
  return comparator(a, b);
}

function evaluateGame(board, players) {
  const results = players.map((player) => {
    const allCards = board.concat(player.hole);
    const best = EVALUATORS.map((evaluator) => evaluator(allCards)).find(Boolean);
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
