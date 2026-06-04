export function renderBoard(board, containerId, hideShips) {
  const container = document.getElementById(containerId);
  const grid = board.board;
  const size = grid.length;
  container.innerHTML = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      const state = grid[y][x];
      if (state.hit && state.ship && hideShips) {
        cell.classList.add('hit');
      } else if (state.hit && state.ship) {
        cell.classList.add(`ship-${state.ship.name}`, 'hit-ship');
      } else if (state.hit) {
        cell.classList.add('miss');
      } else if (state.ship && !hideShips) {
        cell.classList.add(`ship-${state.ship.name}`);
      }
      container.appendChild(cell);
    }
  }
}
