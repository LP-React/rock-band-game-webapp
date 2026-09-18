import { useSession } from '../App'

export function MenuVariant() {
  const { menuVariant, setMenuVariant } = useSession()
  return <div className="menu-variants" role="group" aria-label="Variante de diseño">
    <button aria-pressed={menuVariant === 'arcade'} onClick={() => setMenuVariant('arcade')}>01 / Arcade</button>
    <button aria-pressed={menuVariant === 'encore'} onClick={() => setMenuVariant('encore')}>02 / Encore</button>
  </div>
}
