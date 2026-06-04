export default function Gameboard(size) {
  const ships = new Set();

  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ ship: null, hit: false })),
  );

  const placeShip = (ship, coordX, coordY, direction = "horizontal") => {
    if (coordX < 0 || coordX > size - 1 || coordY < 0 || coordY > size - 1)
      throw Error("Coordinate is out of bounds");

    if (direction === "horizontal") {
      if (coordX + ship.size > size)
        throw Error("Placement of ship is out of bounds");

      for (let i = 0; i < ship.size; i++) {
        if (board[coordY][coordX + i].ship)
          throw Error("Cell is already occupied");
      }
      for (let i = 0; i < ship.size; i++) {
        board[coordY][coordX + i].ship = ship;
      }
    } else if (direction === "vertical") {
      if (coordY + ship.size > size)
        throw Error("Placement of ship is out of bounds");

      for (let i = 0; i < ship.size; i++) {
        if (board[coordY + i][coordX].ship)
          throw Error("Cell is already occupied");
      }
      for (let i = 0; i < ship.size; i++) {
        board[coordY + i][coordX].ship = ship;
      }
    }

    ships.add(ship);
  };

  const receiveAttack = (coordX, coordY) => {
    if (coordX < 0 || coordX > size - 1 || coordY < 0 || coordY > size - 1)
      throw Error("Coordinate is out of bounds");

    const cell = board[coordY][coordX];
    if (cell.hit) throw Error("Cell is already hit");

    cell.hit = true;

    if (cell.ship) {
      cell.ship.hit();
      return cell.ship.name;
    }

    return "miss";
  };

  const allSunk = () => {
    return ships.size > 0 && [...ships].every((s) => s.isSunk());
  };

  return {
    get board() {
      return board;
    },
    placeShip,
    receiveAttack,
    allSunk,
  };
}
