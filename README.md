# Poker TDD (Texas Hold'em)

## Setup

- Install dependencies: `npm install`
- Run tests: `npm test`

## Card Notation

- Ranks: `2 3 4 5 6 7 8 9 T J Q K A`
- Suits: `S H D C` (spades, hearts, diamonds, clubs)
- Example: `AS` (Ace of spades), `TD` (Ten of diamonds)

## API

`evaluateGame(board, players)`

- `board`: array of 5 cards, e.g. `["AS", "KD", "7H", "7S", "2C"]`
- `players`: array of objects: `{ id, hole }` where `hole` is 2 cards
- returns:
	```json
	{
		"winners": ["p1"],
		"players": [
			{
				"id": "p1",
				"best": {
					"category": "High Card",
					"chosen5": ["AS", "KD", "7S", "7H", "2C"]
				}
			}
		]
	}
	```

## Rules & Assumptions

- Hand categories order (highest to lowest): Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.
- Tie-break rules: per Wikipedia.
- Input validity: assume no duplicate cards (documented here).

## `chosen5` Ordering (deterministic)

The 5 cards are returned in a stable, category-specific order:

- Straight / Straight Flush: highest to lowest (wheel: `5 4 3 2 A`)
- Four of a Kind: four cards (quad rank) first, then kicker
- Full House: three-of-a-kind rank first, then the pair rank
- Flush / High Card: cards in descending rank
- Three of a Kind: triplet first, then remaining kickers in descending rank
- Two Pair: higher pair, lower pair, then kicker
- One Pair: pair first, then remaining three kickers in descending rank

