import { addDefault, AnyFn } from '@edsolater/fnkit'

let eventId = 1

export interface EventListenerController {
  eventId: number
  abort(): void
}

//IDEA: maybe I should use weakMap here
// TODO: why not use native abort controller
const eventIdMap = new Map<number, { el: Element | undefined | null; eventName: string; cb: AnyFn }>()

// TODO: !!! move to domkit
export function addEventListener<El extends HTMLElement | undefined | null, K extends keyof HTMLElementEventMap>(
  el: El,
  eventName: K,
  fn: (payload: { ev: HTMLElementEventMap[K]; el: El; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: AddEventListenerOptions
): EventListenerController {
  const defaultedOptions = addDefault(options ?? {}, { passive: true })

  const targetEventId = eventId++
  const controller = {
    eventId: targetEventId,
    abort() {
      cleanEventListener(targetEventId)
    }
  }
  const newEventCallback = (ev: Event) => {
    fn({ el, ev: ev as HTMLElementEventMap[K], eventListenerController: controller })
  }
  el?.addEventListener(eventName as unknown as string, newEventCallback, defaultedOptions)
  eventIdMap.set(targetEventId, { el, eventName: eventName as unknown as string, cb: newEventCallback })
  return controller
}

function cleanEventListener(id: number | undefined | null) {
  if (!id || !eventIdMap.has(id)) return
  const { el, eventName, cb } = eventIdMap.get(id)!
  el?.removeEventListener(eventName, cb)
  eventIdMap.delete(id)
}
