export let storage: Storage
try {
  storage = window.localStorage
} catch {
  let fallbackStorage: Record<string, string> = {}
  storage = {
    get length () {
      return Object.keys(fallbackStorage).length
    },
    clear () {
      fallbackStorage = {}
    },
    key (index: number) {
      return Object.keys(fallbackStorage)[index]
    },
    getItem (key: string) {
      return fallbackStorage[key] ?? null
    },
    removeItem (key: string) {
      delete fallbackStorage[key]
    },
    setItem (key) {
      fallbackStorage[key] = key
    }
  }
}
