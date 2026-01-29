'use client'

import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  action: () => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], dependencies: unknown[] = []) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key === shortcut.key
        const ctrlMatch = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : true
        const metaMatch = shortcut.metaKey ? e.metaKey : true

        if (keyMatch && ctrlMatch && metaMatch) {
          if (shortcut.preventDefault) {
            e.preventDefault()
          }
          shortcut.action()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts, ...dependencies])
}
