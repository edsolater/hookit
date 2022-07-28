import { isExist } from '@edsolater/fnkit'
import { MutableRefObject, useMemo } from 'react'
import { createRef, useRef } from 'react'

type CallbackRefOptions<T> = {
  defaultValue?: T
  onAttach?: (current: T) => void
  onDetach?: () => void
  onChange?: (current: T, prev: T) => void
}

/**
 * @return proxied { current: xxx }
 */
export default function useCallbackRef<T = unknown>(
  options?: CallbackRefOptions<T>
): MutableRefObject<T> & { onChange: (cb: (v: T, prev: T | undefined) => void) => void } {
  const originalRef = useRef<T>(options?.defaultValue ?? null) as unknown as MutableRefObject<T>
  const onChangeCallbacks = useRef<CallbackRefOptions<T>['onChange'][]>([options?.onChange])
  const richRef = useMemo(
    () => ({
      get current() {
        return originalRef.current
      },
      set current(value) {
        originalRef.current = value
        if (isExist(value)) {
          options?.onAttach?.(value)
          const prev = originalRef.current
          onChangeCallbacks.current.forEach((onChange) => onChange?.(value, prev))
        }
        if (!isExist(value)) {
          options?.onDetach?.()
        }
      },
      onChange: (cb: (v: T, prev: T | undefined) => void, options?: { hasInit?: boolean }) => {
        // init invoke
        if (options?.hasInit && originalRef.current != null) {
          cb(originalRef.current, undefined)
        }
        onChangeCallbacks.current.push(cb)
      }
    }),
    []
  )
  return richRef
}

export function createCallbackRef<T = unknown>(callback: (current: T) => void) {
  const originalRef = createRef<T>()
  return new Proxy(originalRef, {
    set(target, p, value) {
      callback(value)
      return Reflect.set(target, p, value)
    }
  })
}
