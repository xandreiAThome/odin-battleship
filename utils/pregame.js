import { BOARD_SIZE, SHIPS } from './constants.js';
import Ship from '../entities/Ship.js';
import Gameboard from '../entities/Gameboard.js';
import { renderBoard } from './dom.js';
import { placeShipsRandomly } from './setup.js';

function getShipCells(x, y, size, direction) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells.push(direction === 'horizontal' ? [x + i, y] : [x, y + i]);
  }
  return cells;
}

export function cleanupPregame() {
  document.getElementById('ship-pool')?.remove();
  document.querySelector('.pregame-controls')?.remove();
}

let savedEnemySection = null;

export function restoreEnemySection() {
  if (savedEnemySection) {
    document.getElementById('boards').appendChild(savedEnemySection);
    savedEnemySection = null;
  }
}

export function initPregame(player, onComplete) {
  const section = document.getElementById('player-section');
  const boardEl = document.getElementById('player-board');
  savedEnemySection = document.getElementById('enemy-section');
  savedEnemySection.remove();

  const ships = SHIPS.map(([name, size]) => ({ name, size, placed: false }));
  let selected = null;
  let direction = 'horizontal';
  let previewCells = [];

  function clearPreview() {
    previewCells.forEach(([x, y]) => {
      const cell = boardEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (cell) cell.classList.remove('preview-valid', 'preview-invalid');
    });
    previewCells = [];
  }

  function updatePreview(x, y) {
    clearPreview();
    if (!selected) return false;

    const cells = getShipCells(x, y, selected.size, direction);
    const valid = cells.every(([cx, cy]) => {
      if (cx < 0 || cx >= BOARD_SIZE || cy < 0 || cy >= BOARD_SIZE) return false;
      return !player.gameboard.board[cy][cx].ship;
    });

    previewCells = cells;
    cells.forEach(([cx, cy]) => {
      const cell = boardEl.querySelector(`[data-x="${cx}"][data-y="${cy}"]`);
      if (cell) cell.classList.add(valid ? 'preview-valid' : 'preview-invalid');
    });
    return valid;
  }

  function tryPlace(x, y) {
    if (!selected) return false;
    if (!updatePreview(x, y)) return false;

    const ship = Ship(selected.name, selected.size);
    try {
      player.gameboard.placeShip(ship, x, y, direction);
    } catch {
      return false;
    }

    selected.placed = true;
    selected = null;
    clearPreview();
    renderBoard(player.gameboard, 'player-board', false);
    renderPool();
    checkComplete();
    return true;
  }

  function checkComplete() {
    const startBtn = document.getElementById('start-game');
    if (ships.every(s => s.placed)) {
      startBtn.style.display = 'inline-block';
    }
  }

  function renderPool() {
    let pool = document.getElementById('ship-pool');
    if (!pool) {
      pool = document.createElement('div');
      pool.id = 'ship-pool';
      const h2 = section.querySelector('h2');
      h2.insertAdjacentElement('afterend', pool);
    }
    pool.innerHTML = '';
    ships.forEach(s => {
      const item = document.createElement('div');
      item.className = 'ship-item';
      if (s.placed) item.classList.add('placed');
      if (selected === s) item.classList.add('selected');
      item.textContent = `${s.name} (${s.size})`;

      item.addEventListener('click', () => {
        if (s.placed) return;
        selected = selected === s ? null : s;
        direction = 'horizontal';
        clearPreview();
        renderPool();
      });

      pool.appendChild(item);
    });
  }

  boardEl.addEventListener('mousemove', (e) => {
    const cell = e.target.closest('.cell');
    if (cell && selected) {
      updatePreview(parseInt(cell.dataset.x), parseInt(cell.dataset.y));
    } else if (!cell) {
      clearPreview();
    }
  });

  boardEl.addEventListener('mouseleave', () => clearPreview());

  boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell && selected) tryPlace(parseInt(cell.dataset.x), parseInt(cell.dataset.y));
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'r' || e.key === 'R') && selected) {
      e.preventDefault();
      direction = direction === 'horizontal' ? 'vertical' : 'horizontal';
      clearPreview();
      renderPool();
    }
  });

  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'pregame-controls';

  const resetBtn = document.createElement('button');
  resetBtn.id = 'reset-place';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    player.gameboard = Gameboard(BOARD_SIZE);
    ships.forEach(s => s.placed = false);
    selected = null;
    direction = 'horizontal';
    clearPreview();
    renderBoard(player.gameboard, 'player-board', false);
    renderPool();
    startBtn.style.display = 'none';
  });
  btnWrapper.appendChild(resetBtn);

  const randomBtn = document.createElement('button');
  randomBtn.id = 'random-place';
  randomBtn.textContent = 'Place Randomly';
  randomBtn.addEventListener('click', () => {
    player.gameboard = Gameboard(BOARD_SIZE);
    placeShipsRandomly(player.gameboard);
    renderBoard(player.gameboard, 'player-board', false);
    cleanupPregame();
    onComplete();
  });
  btnWrapper.appendChild(randomBtn);

  const startBtn = document.createElement('button');
  startBtn.id = 'start-game';
  startBtn.textContent = 'Start Battle';
  startBtn.style.display = 'none';
  startBtn.addEventListener('click', () => {
    cleanupPregame();
    onComplete();
  });
  btnWrapper.appendChild(startBtn);

  const instr = document.createElement('p');
  instr.id = 'pregame-instr';
  instr.textContent = 'Click a ship, then click the board. Press R to rotate.';
  btnWrapper.appendChild(instr);

  section.appendChild(btnWrapper);

  renderBoard(player.gameboard, 'player-board', false);
  renderPool();
}
