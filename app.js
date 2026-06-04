import Player from "./entities/Player.js";
import { BOARD_SIZE } from "./utils/constants.js";
import { shuffle } from "./utils/utils.js";
import { placeShipsRandomly } from "./utils/setup.js";
import { renderBoard } from "./utils/dom.js";
import { initPregame, restoreEnemySection } from "./utils/pregame.js";

const player = Player("Player");
const computer = Player("Computer", true);

initPregame(player, () => startGame());

function startGame() {
  restoreEnemySection();
  placeShipsRandomly(computer.gameboard);

  const attackQueue = shuffle(
    Array.from({ length: BOARD_SIZE }, (_, y) =>
      Array.from({ length: BOARD_SIZE }, (_, x) => [x, y]),
    ).flat(),
  );

  let playerTurn = true;
  let gameOver = false;

  const statusEl = document.getElementById("status");
  const enemySection = document.getElementById("enemy-section");

  function render() {
    renderBoard(player.gameboard, "player-board", false);
    renderBoard(computer.gameboard, "enemy-board", true);
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function endGame(winner) {
    gameOver = true;
    setStatus(`${winner} wins! All ships sunk.`);
    const btn = document.createElement("button");
    btn.id = "play-again";
    btn.textContent = "Play Again";
    btn.addEventListener("click", () => location.reload());
    statusEl.after(btn);
  }

  function computerTurn() {
    if (gameOver) return;

    const [x, y] = attackQueue.pop();
    const result = player.gameboard.receiveAttack(x, y);
    render();

    if (player.gameboard.allSunk()) {
      endGame("Computer");
      return;
    }

    const state = player.gameboard.board[y][x];

    if (result !== "miss") {
      if (state.ship.isSunk()) {
        setStatus(`Computer sunk the ${result}! It attacks again.`);
      } else {
        setStatus(`Computer hit the ${result}! It attacks again.`);
      }
      setTimeout(computerTurn, 1500);
    } else {
      playerTurn = true;
      enemySection.classList.remove("disabled");
      setStatus("Miss! Your turn.");
    }
  }

  function handleEnemyClick(e) {
    const cell = e.target;
    if (!cell.classList.contains("cell")) return;
    if (gameOver || !playerTurn) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    const state = computer.gameboard.board[y][x];
    if (state.hit) return;

    const result = computer.gameboard.receiveAttack(x, y);
    render();

    if (computer.gameboard.allSunk()) {
      endGame("Player");
      return;
    }

    if (result !== "miss") {
      if (state.ship.isSunk()) {
        setStatus(`You have sunk the ${result}! Attack again.`);
      } else {
        setStatus(`You hit a ship! Attack again.`);
      }
    } else {
      playerTurn = false;
      enemySection.classList.add("disabled");
      setStatus("Miss! Computer's turn...");
      setTimeout(computerTurn, 1000);
    }
  }

  render();
  setStatus("Click the enemy board to attack!");
  document.getElementById("enemy-board").addEventListener("click", handleEnemyClick);
}
