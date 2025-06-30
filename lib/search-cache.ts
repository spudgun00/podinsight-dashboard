// Simple in-memory cache for search results
interface CacheEntry {
  data: any
  timestamp: number
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(query: string, limit: number, offset: number): string {
    return `${query.toLowerCase().trim()}-${limit}-${offset}`
  }

  get(query: string, limit: number, offset: number): any | null {
    const key = this.getCacheKey(query, limit, offset)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  set(query: string, limit: number, offset: number, data: any): void {
    const key = this.getCacheKey(query, limit, offset)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    
    // Limit cache size to prevent memory leaks
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

export const searchCache = new SearchCache()