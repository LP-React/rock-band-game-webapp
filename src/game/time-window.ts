// Sorted chart/beat bounds preserve original indices used by judgment and sustains.
export function lowerBound<T>(items: readonly T[], time: number, value: (item: T) => number): number {
  let low = 0, high = items.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (value(items[middle]) < time) low = middle + 1
    else high = middle
  }
  return low
}
export function upperBound<T>(items: readonly T[], time: number, value: (item: T) => number): number {
  let low = 0, high = items.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (value(items[middle]) <= time) low = middle + 1
    else high = middle
  }
  return low
}
export const noteTime = (note: { time: number }) => note.time
export const beatTime = (beat: number) => beat
