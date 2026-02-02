'use client'

import { useState, useEffect } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  url: string,
  options?: RequestInit
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const res = await fetch(url, options)
        if (!res.ok) throw new Error('API error')
        const json = await res.json()

        if (isMounted) {
          setState({
            data: json?.data || json,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error:
              error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [url, options])

  return state
}
