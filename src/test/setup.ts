import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    clear() {
      store = {}
    },
    removeItem(key: string) {
      delete store[key]
    },
    get length() {
      return Object.keys(store).length
    },
    key(index: number) {
      return Object.keys(store)[index] || null
    }
  }
})()

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })
}

// Ensure globalThis also has it
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})
