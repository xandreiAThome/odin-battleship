import Gameboard from "./Gameboard.js";

const BOARD_SIZE = 10;

export default function Player(
  name,
  isComputer = false,
  boardsize = BOARD_SIZE,
) {
  return {
    get name() {
      return name;
    },
    gameboard: Gameboard(boardsize),
  };
}
