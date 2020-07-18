/**
 * @description Get a random number in a range [min=0, max]
 * @param {number} max - Interval maximum
 * @param {number} min - The minimum value of the interval, the default is 0
 * @param {bool} int - Whether it is an integer, the default is true, which is an integer
 */
export const generateRandom = (max, min = 0, int = true) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  const res = Math.random() * (max - min + 1) + min;
  return int ? Math.floor(res) : res;
};
