import { RefObject, useEffect } from 'react'
import { getHTMLElementsFromRefs, HTMLElementRefs } from '../utils/react/getElementsFromRefs'

import { useToggle } from './useToggle'

export interface UseClickOptions {
  disable?: boolean
  onClick?: (ev: { el: EventTarget; nativeEvent: MouseEvent }) => void
  onActiveStart?: (ev: { el: EventTarget; nativeEvent: PointerEvent }) => void
  onActiveEnd?: (ev: { el: EventTarget; nativeEvent: PointerEvent }) => void
}

export default function useClick(
  refs: HTMLElementRefs,
  { disable, onClick, onActiveStart, onActiveEnd }: UseClickOptions = {}
) {
  const [isActive, { on: turnOnActive, off: turnOffActive }] = useToggle(false)

  useEffect(() => {
    if (disable) return
    const handleClick = (ev: Event) => onClick?.({ el: ev.target!, nativeEvent: ev as MouseEvent })
    const handlePointerDown = (ev: PointerEvent) => {
      turnOnActive()
      onActiveStart?.({ el: ev.target!, nativeEvent: ev! })
    }
    const handlePointerUp = (ev: PointerEvent) => {
      turnOffActive()
      onActiveEnd?.({ el: ev.target!, nativeEvent: ev! })
    }
    const els = getHTMLElementsFromRefs(refs)
    els.forEach((el) => el.addEventListener('pointerdown', handlePointerDown)) // TODO use domkit addEventListener
    els.forEach((el) => el.addEventListener('pointerup', handlePointerUp))
    els.forEach((el) => el.addEventListener('pointercancel', handlePointerDown))
    els.forEach((el) => el.addEventListener('click', handleClick))
    return () => {
      els.forEach((el) => el.removeEventListener('pointerdown', handlePointerDown))
      els.forEach((el) => el.removeEventListener('pointerup', handlePointerUp))
      els.forEach((el) => el.removeEventListener('pointercancel', handlePointerDown))
      els.forEach((el) => el.removeEventListener('click', handleClick))
    }
  }, [disable, onClick, onActiveStart, onActiveEnd])

  return isActive
}
