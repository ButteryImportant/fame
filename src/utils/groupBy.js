/**
 * Groups an array by a key function — safe replacement for Object.groupBy (ES2024).
 * @template T
 * @param {T[]} arr
 * @param {(item: T) => string} fn
 * @returns {Record<string, T[]>}
 */
export function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}
