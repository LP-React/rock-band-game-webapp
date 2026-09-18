import { useEffect } from 'react'

// Menu shortcuts remain available after route transitions and pointer interactions.
export function useMenuKeyboard(handle: (event: KeyboardEvent) => void) {
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing || document.querySelector('dialog[open]')) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable=true]')) return
      if (event.repeat && (event.key === 'Enter' || event.key === 'Escape')) return
      handle(event)
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [handle])
}
