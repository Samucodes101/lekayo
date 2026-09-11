import { useEffect, useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"

export function useLiveSearch<T>(query: string, endpoint: string, delay = 300) {
  const debouncedQuery = useDebounce(query.trim(), delay)
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    if (debouncedQuery.length < 2) {
      setResults([])
      setLoading(false)
      return () => controller.abort()
    }

    setLoading(true)
    fetch(`${endpoint}${endpoint.includes("?") ? "&" : "?"}q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((data) => {
        if (!controller.signal.aborted) setResults(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQuery, endpoint])

  return { results, loading }
}
