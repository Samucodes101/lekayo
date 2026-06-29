import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(initialValue)
  useEffect(() => {
    const item = localStorage.getItem(key)
    if (item) setStored(JSON.parse(item))
  }, [key])
  const setValue = (value: T) => {
    setStored(value)
    localStorage.setItem(key, JSON.stringify(value))
  }
  return [stored, setValue]
}