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

  const huntQueue = shuffle(
    Array.from({ length: BOARD_SIZE }, (_, y) =>
      Array.from({ length: BOARD_SIZE }, (_, x) => [x, y]),
    ).flat(),
  );

  let targetMode = false;
  let targetOrigin = null;
  let lastHit = null;
  let probeDir = null;
  let remainingDirs = [];

  const inBounds = (x, y) =>
    x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

  const isCellHit = (x, y) => player.gameboard.board[y][x].hit;

  function pickTarget() {
    if (targetMode) {
      if (probeDir) {
        const x = lastHit[0] + probeDir[0];
        const y = lastHit[1] + probeDir[1];
        if (inBounds(x, y) && !isCellHit(x, y)) return [x, y];
        probeDir = null;
      }
      while (remainingDirs.length > 0) {
        const dir = remainingDirs.shift();
        const x = targetOrigin[0] + dir[0];
        const y = targetOrigin[1] + dir[1];
        if (inBounds(x, y) && !isCellHit(x, y)) {
          probeDir = dir;
          return [x, y];
        }
      }
      targetMode = false;
    }
    while (huntQueue.length > 0) {
      const cell = huntQueue.pop();
      if (!isCellHit(cell[0], cell[1])) return cell;
    }
    return null;
  }

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

    const target = pickTarget();
    if (!target) return;
    const [x, y] = target;
    const result = player.gameboard.receiveAttack(x, y);
    render();

    if (player.gameboard.allSunk()) {
      endGame("Computer");
      return;
    }

    const state = player.gameboard.board[y][x];

    if (result !== "miss") {
      lastHit = [x, y];

      if (state.ship.isSunk()) {
        targetMode = false;
        targetOrigin = null;
        lastHit = null;
        probeDir = null;
        remainingDirs = [];
        setStatus(`Computer sunk the ${result}! It attacks again.`);
      } else {
        if (!targetMode) {
          targetMode = true;
          targetOrigin = [x, y];
          remainingDirs = shuffle([
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
          ]);
          probeDir = null;
        }
        setStatus(`Computer hit the ${result}! It attacks again.`);
      }
      setTimeout(computerTurn, 1500);
    } else {
      if (probeDir) probeDir = null;
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
  document
    .getElementById("enemy-board")
    .addEventListener("click", handleEnemyClick);
}
