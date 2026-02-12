# Poker TDD (Texas Hold'em)

## Configuration

- Installer les dépendances: `npm install`
- Lancer les tests: `npm test`

## Notation des cartes

- Rangs: `2 3 4 5 6 7 8 9 T V D R A`
- Couleurs: `P C C K` (pique, cœur, carreau, trèfle)
- Exemple: `AP` (As de pique), `TP` (Dix de carreau)

## API

`evaluateGame(board, players)`

- `board`: tableau de 5 cartes, ex: `["AP", "RD", "7C", "7P", "2K"]`
- `players`: tableau d'objets: `{ id, hole }` où `hole` contient 2 cartes
- retourne:
	```json
	{
		"winners": ["j1"],
		"players": [
			{
				"id": "j1",
				"best": {
					"category": "Carte haute",
					"chosen5": ["AP", "RD", "7P", "7C", "2K"]
				}
			}
		]
	}
	```

## Règles et hypothèses

- Ordre des catégories de mains (du plus fort au plus faible): Quinte flush, Carré, Full, Couleur, Quinte, Brelan, Deux paires, Une paire, Carte haute.
- Règles de départage: selon Wikipedia.
- Validité d'entrée: on suppose qu'il n'y a pas de doublons de cartes.

## Ordre des `chosen5` (déterministe)

Les 5 cartes sont retournées dans un ordre stable, spécifique à la catégorie:

- Quinte / Quinte flush: du plus fort au plus faible (roue: `5 4 3 2 A`)
- Carré: les quatre cartes du carré d'abord, puis le kicker
- Full: le rang du brelan d'abord, puis le rang de la paire
- Couleur / Carte haute: cartes en ordre décroissant
- Brelan: le triplet d'abord, puis les kickers restants en ordre décroissant
- Deux paires: la plus forte paire, la plus faible paire, puis le kicker
- Une paire: la paire d'abord, puis les trois kickers restants en ordre décroissant

## Catégories de mains

1. **Quinte flush** : cinq cartes de même couleur qui forment une séquence
2. **Carré** : quatre cartes du même rang
3. **Full** : un brelan et une paire
4. **Couleur** : cinq cartes de la même couleur
5. **Quinte** : cinq cartes qui forment une séquence (la roue A-2-3-4-5 est valide)
6. **Brelan** : trois cartes du même rang
7. **Deux paires** : deux paires différentes
8. **Une paire** : deux cartes du même rang
9. **Carte haute** : la meilleure combinaison possible sans pattern

## Hypothèse sur la roue (A-2-3-4-5)

La roue (A-2-3-4-5) est une quinte valide où l'As est considéré comme la carte la plus basse. Elle perd contre toute autre quinte (6-7-8-9-10 la plus basse).

## TDD et Git

- Tous les tests doivent être écrits **avant** l'implémentation.
- Les commits doivent montrer une séparation claire: tests → code → refactor.
- La couverture de tests doit inclure chaque catégorie, le départage, et les cas de plateau.


