import { useEffect } from 'react'

import { getHTMLElementsFromRefs, HTMLElementRefs } from '../utils/react/getElementsFromRefs'
import { useToggle } from './useToggle'

//#region ------------------- hook: useHover() -------------------

export interface UseHoverOptions {
  disable?: boolean
  onHoverStart?: (ev: { el: EventTarget; nativeEvent: PointerEvent }) => void
  onHoverEnd?: (ev: { el: EventTarget; nativeEvent: PointerEvent }) => void
  onHover?: (ev: { el: EventTarget; nativeEvent: PointerEvent; is: 'start' | 'end' }) => void
}

export default function useHover(
  refs: HTMLElementRefs,
  { disable, onHoverStart, onHoverEnd, onHover }: UseHoverOptions = {}
) {
  if (!refs) return
  const [isHovered, { on: turnonHover, off: turnoffHover }] = useToggle(false)

  useEffect(() => {
    if (disable) return
    const hoverStartHandler = (ev: PointerEvent) => {
      turnonHover()
      onHover?.({
        el: ev.target!,
        nativeEvent: ev!,
        is: 'start'
      })
      onHoverStart?.({
        el: ev.target!,
        nativeEvent: ev!
      })
    }
    const hoverEndHandler = (ev: PointerEvent) => {
      turnoffHover()
      onHover?.({
        el: ev.target!,
        nativeEvent: ev!,
        is: 'end'
      })
      onHoverEnd?.({
        el: ev.target!,
        nativeEvent: ev!
      })
    }
    const els = getHTMLElementsFromRefs(refs)
    els.forEach((el) => el.addEventListener('pointerenter', hoverStartHandler))
    els.forEach((el) => el.addEventListener('pointerleave', hoverEndHandler))
    els.forEach((el) => el.addEventListener('pointercancel', hoverEndHandler))
    return () => {
      els.forEach((el) => el.removeEventListener('pointerenter', hoverStartHandler))
      els.forEach((el) => el.removeEventListener('pointerleave', hoverEndHandler))
      els.forEach((el) => el.removeEventListener('pointercancel', hoverEndHandler))
    }
  }, [disable, onHoverStart, onHoverEnd, onHover])

  return isHovered
}
