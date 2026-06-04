import Ship from "../entities/Ship.js";
import { BOARD_SIZE, SHIPS } from "../utils/constants.js";

export function placeShipsRandomly(gameboard) {
  for (const [name, size] of SHIPS) {
    const ship = Ship(name, size);
    let placed = false;
    while (!placed) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
      try {
        gameboard.placeShip(ship, x, y, direction);
        placed = true;
      } catch (_) {
        /* retry with new random position */
      }
    }
  }
}
