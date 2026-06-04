# Odin Battleship

Classic Battleship game built with vanilla JavaScript. Place your fleet and battle against a computer opponent.

## Ships

| Ship       | Size |
| ---------- | ---- |
| Carrier    | 5    |
| Battleship | 4    |
| Cruiser    | 3    |
| Submarine  | 3    |
| Destroyer  | 2    |

## How to Play

1. Click a ship from the pool to select it
2. Click a board cell to place it (press **R** to rotate)
3. Click **Place Randomly** to auto-arrange
4. Click enemy cells to fire — hits grant another turn

## Scripts

```bash
npm test       # Run tests with Vitest
```

## Structure

```
├── entities/        # Ship, Gameboard, Player
├── utils/           # DOM rendering, setup, constants
├── app.js           # Game loop
├── index.html       # Entry point
└── styles.css       # Styling
```
