export function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, milliseconds)
    function abort() { clearTimeout(timer); reject(signal.reason) }
    signal.addEventListener('abort', abort, { once: true })
  })
}
export async function prepareImage(url: string, signal: AbortSignal) {
  signal.throwIfAborted()
  const image = new Image()
  image.src = url
  // Artwork failures do not prevent an otherwise playable song from starting.
  await image.decode().catch(() => undefined)
  signal.throwIfAborted()
}
export async function countdown(signal: AbortSignal, onStep: (step: number) => void) {
  for (let step = 3; step > 0; step--) {
    while (document.hidden) await wait(100, signal)
    onStep(step)
    await wait(700, signal)
    if (document.hidden) step++
  }
}
