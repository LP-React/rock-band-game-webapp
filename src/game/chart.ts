export interface ChartNote { time: number; lanes: number[]; durations?: number[]; open?: boolean; openDuration?: number }
export const DURATION = 20
export const HIT_WINDOW = 0.14 // Prototype value, not a Clone Hero specification.
const pattern = [[0], [0], [1], [2], [0], [3], [2], [1], [0, 2], [1], [3], [4], [2, 4], [3], [1], [0]]
export const chart: ChartNote[] = Array.from({ length: 32 }, (_, index) => ({
  time: 2 + index * 0.5,
  lanes: [...pattern[index % pattern.length]],
}))
// The musical arrangement is separate from fret colors: this is demo audio,
// not a mapping from a green/red/etc. button to a fixed musical pitch.
export const riffPitches = [40, 40, 43, 45, 40, 47, 45, 43, 40, 43, 47, 48, 45, 47, 43, 40]
