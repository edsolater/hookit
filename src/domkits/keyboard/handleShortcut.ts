import { addEventListener, EventListenerController } from '../../utils/dom/addEventListener'
import { mapKey, shakeFalsy, toLowerCase, unified } from '@edsolater/fnkit'
import addTabIndex from '../../utils/dom/addTabIndex'

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export type ContentKeyName = KeyNamesActionKey | KeyNamesNavigation | KeyNamesNormalContent
export type AuxiliaryKeyName =
  | 'ctrl'
  | 'shift'
  | 'alt'
  | 'ctrl + alt'
  | 'ctrl + shift'
  | 'alt + shift'
  | 'ctrl + alt + shift'
type KeyNamesActionKey = `F${number}` | 'Backspace' | 'Enter' | 'Escape' | 'Delete' | 'Insert'
type KeyNamesNormalContent =
  | '`'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '0'
  | '-'
  | '='
  | 'q'
  | 'w'
  | 'e'
  | 'r'
  | 't'
  | 'y'
  | 'u'
  | 'i'
  | 'o'
  | 'p'
  | '['
  | ']'
  | '\\'
  | 'a'
  | 's'
  | 'd'
  | 'f'
  | 'g'
  | 'h'
  | 'j'
  | 'k'
  | 'l'
  | ';'
  | "'"
  | 'z'
  | 'x'
  | 'c'
  | 'v'
  | 'b'
  | 'n'
  | 'm'
  | ','
  | '.'
  | '/'
type KeyNamesNavigation =
  | 'Tab'
  | 'Home'
  | 'PageUp'
  | 'PageDown'
  | 'End'
  | 'ArrowUp'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowDown'
type KeyboardShortcutSetting = {
  [key in `${`${AuxiliaryKeyName} + ` | ''}${ContentKeyName}`]?: () => void
}
export function bindKeyboardShortcut(
  el: HTMLElement,
  keyboardShortcutSetting: KeyboardShortcutSetting
): EventListenerController {
  const formatedKeyboardShortcutSetting = mapKey(keyboardShortcutSetting, (key) =>
    formatKeyboardSettingString(String(key))
  )
  addTabIndex(el) // keydown must have fousable element
  return addEventListener(
    el,
    'keydown',
    ({ ev }) => {
      const pressedKey = parseKeyboardEventToGetKeyString(ev)
      formatedKeyboardShortcutSetting[pressedKey]?.()
    },
    { capture: true }
  )
}
/** this still not prevent **all** brower shortcut (like build-in ctrl T ) */
export function preventDefaultKeyboardShortcut(pureEl: HTMLElement) {
  pureEl.addEventListener(
    'keydown',
    (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
    },
    { capture: true }
  )
}
function parseKeyboardEventToGetKeyString(ev: KeyboardEvent) {
  const keyArray = [ev.ctrlKey && 'ctrl', ev.shiftKey && 'shift', ev.altKey && 'alt', ev.metaKey && 'meta', ev.key]
  return unified(shakeFalsy(keyArray).map(toLowerCase)).sort().join(' + ')
}
function formatKeyboardSettingString(keyString: string) {
  const keyArray = keyString.split(/\s?\+\s?/)
  return unified(shakeFalsy(keyArray).map(toLowerCase)).sort().join(' + ')
}
