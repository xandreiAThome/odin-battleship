import { expect, test, describe } from "vitest";
import Gameboard from "../entities/Gameboard.js";
import Ship from "../entities/Ship.js";

describe("Gameboard", () => {
  test("Initialized gameboard has the right size for the board", () => {
    const board = Gameboard(3);

    expect(board.board.length).toBe(3);
    for (let i = 0; i < board.board.length; i++) {
      expect(board.board[i].length).toBe(3);
    }
  });

  test("Placing ship out of bounds throws an error", () => {
    const board = Gameboard(3);
    expect(() => board.placeShip(Ship("test", 1), -1, -1)).toThrow();
  });

  test("places a ship horizontally", () => {
    const board = Gameboard(5);
    const ship = Ship("carrier", 3);

    board.placeShip(ship, 0, 2, "horizontal");

    expect(board.board[2][0]).toEqual({ ship, hit: false });
    expect(board.board[2][1]).toEqual({ ship, hit: false });
    expect(board.board[2][2]).toEqual({ ship, hit: false });
    expect(board.board[2][3]).toEqual({ ship: null, hit: false });
    expect(board.board[2][4]).toEqual({ ship: null, hit: false });
  });

  test("places a ship vertically", () => {
    const board = Gameboard(5);
    const ship = Ship("carrier", 3);

    board.placeShip(ship, 2, 0, "vertical");

    expect(board.board[0][2]).toEqual({ ship, hit: false });
    expect(board.board[1][2]).toEqual({ ship, hit: false });
    expect(board.board[2][2]).toEqual({ ship, hit: false });
    expect(board.board[3][2]).toEqual({ ship: null, hit: false });
    expect(board.board[4][2]).toEqual({ ship: null, hit: false });
  });

  test("placing ship beyond horizontal bounds throws", () => {
    const board = Gameboard(3);
    expect(() =>
      board.placeShip(Ship("test", 3), 1, 0, "horizontal"),
    ).toThrow();
  });

  test("placing ship beyond vertical bounds throws", () => {
    const board = Gameboard(3);
    expect(() => board.placeShip(Ship("test", 3), 0, 1, "vertical")).toThrow();
  });

  test("placing overlapping ships throws", () => {
    const board = Gameboard(5);
    board.placeShip(Ship("a", 3), 0, 0, "horizontal");

    expect(() => board.placeShip(Ship("b", 2), 1, 0, "horizontal")).toThrow();
  });

  test("receiveAttack out of bounds throws", () => {
    const board = Gameboard(3);
    expect(() => board.receiveAttack(-1, 0)).toThrow();
    expect(() => board.receiveAttack(0, 5)).toThrow();
  });

  test("receiveAttack throws error if cell is already hit", () => {
    const board = Gameboard(3);
    board.receiveAttack(0, 2);

    expect(() => board.receiveAttack(0, 2)).toThrow();
  });

  test("receiveAttack returns miss on empty cell", () => {
    const board = Gameboard(3);
    expect(board.receiveAttack(0, 0)).toBe("miss");
  });

  test("receiveAttack records a hit on a ship", () => {
    const board = Gameboard(5);
    const ship = Ship("carrier", 3);
    board.placeShip(ship, 0, 0, "horizontal");

    const result = board.receiveAttack(0, 0);

    expect(result).toBe(ship.name);
    expect(board.board[0][0].hit).toBe(true);
    expect(ship.hitCount).toBe(1);
  });

  test("receiveAttack hits the correct cell of a ship", () => {
    const board = Gameboard(5);
    const ship = Ship("carrier", 3);
    board.placeShip(ship, 0, 0, "horizontal");

    board.receiveAttack(1, 0);

    expect(board.board[0][0].hit).toBe(false);
    expect(board.board[0][1].hit).toBe(true);
    expect(board.board[0][2].hit).toBe(false);
    expect(ship.hitCount).toBe(1);
  });

  test("receiveAttack sinks a ship after enough hits", () => {
    const board = Gameboard(5);
    const ship = Ship("dinghy", 2);
    board.placeShip(ship, 0, 0, "horizontal");

    board.receiveAttack(0, 0);
    expect(ship.isSunk()).toBe(false);

    board.receiveAttack(1, 0);
    expect(ship.isSunk()).toBe(true);
  });

  test("allSunk returns false when no ships exist", () => {
    const board = Gameboard(5);
    expect(board.allSunk()).toBe(false);
  });

  test("allSunk returns false when at least one ship is afloat", () => {
    const board = Gameboard(5);
    board.placeShip(Ship("a", 1), 0, 0, "horizontal");
    board.placeShip(Ship("b", 2), 1, 0, "horizontal");

    board.receiveAttack(0, 0);
    board.receiveAttack(1, 0);

    expect(board.allSunk()).toBe(false);
  });

  test("allSunk returns true when all ships are sunk", () => {
    const board = Gameboard(5);
    board.placeShip(Ship("a", 1), 0, 0, "horizontal");
    board.placeShip(Ship("b", 2), 1, 0, "horizontal");

    board.receiveAttack(0, 0);
    board.receiveAttack(1, 0);
    board.receiveAttack(2, 0);

    expect(board.allSunk()).toBe(true);
  });
});
