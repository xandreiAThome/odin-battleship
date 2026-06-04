export default function Ship(name, size) {
  let hitCount = 0;

  const hit = () => {
    if (hitCount < size) hitCount++;
  };

  const isSunk = () => {
    if (hitCount >= size) return true;

    return false;
  };

  return {
    hit,

    get hitCount() {
      return hitCount;
    },

    get name() {
      return name;
    },

    get size() {
      return size;
    },

    isSunk,
  };
}
