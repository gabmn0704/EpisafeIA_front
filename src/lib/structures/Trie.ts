class TrieNode {
  children = new Map<string, TrieNode>()
  terminal: string | null = null
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

/** Prefix tree for accent-insensitive medication autocomplete. */
export class Trie {
  private root = new TrieNode()
  private count = 0

  get size(): number {
    return this.count
  }

  insert(word: string): void {
    const key = normalize(word)
    if (!key) return
    let node = this.root
    for (const ch of key) {
      let next = node.children.get(ch)
      if (!next) {
        next = new TrieNode()
        node.children.set(ch, next)
      }
      node = next
    }
    if (node.terminal === null) this.count++
    node.terminal = word
  }

  has(word: string): boolean {
    return this.find(normalize(word))?.terminal != null
  }

  /** Returns up to `limit` original words that start with the prefix, alphabetically. */
  search(prefix: string, limit = 8): string[] {
    const start = this.find(normalize(prefix))
    if (!start) return []
    const out: string[] = []
    const walk = (node: TrieNode) => {
      if (out.length >= limit) return
      if (node.terminal !== null) out.push(node.terminal)
      const keys = [...node.children.keys()].sort()
      for (const k of keys) {
        const child = node.children.get(k)
        if (child) walk(child)
      }
    }
    walk(start)
    return out
  }

  private find(key: string): TrieNode | null {
    let node = this.root
    for (const ch of key) {
      const next = node.children.get(ch)
      if (!next) return null
      node = next
    }
    return node
  }
}
