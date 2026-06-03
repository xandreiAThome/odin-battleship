import { describe, expect, test } from "vitest";
import Ship from "../Ship.js";

describe("Ship Factory", () => {
  test("increases hitCount when hit is invoked", () => {
    const ship = Ship("frigate", 3);

    ship.hit();

    expect(ship.hitCount).toBe(1);
  });

  test("if ship is hit equal to its length, should be sunk", () => {
    const ship = Ship("test", 3);

    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });

  test("is not sunk when hitCount is less than length", () => {
    const ship = Ship("test", 3);

    ship.hit();

    expect(ship.isSunk()).toBe(false);
  });

  test("single-length ship sinks on first hit", () => {
    const ship = Ship("dinghy", 1);

    ship.hit();

    expect(ship.isSunk()).toBe(true);
  });

  test("hitCount does not exceed ship length", () => {
    const ship = Ship("test", 2);

    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();

    expect(ship.hitCount).toBe(2);
  });
});
