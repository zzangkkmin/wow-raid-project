import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'

export function useSSE() {
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return

    const es = new EventSource(
      `http://localhost:8088/api/notifications/subscribe?token=${accessToken}`
    )
    esRef.current = es

    es.addEventListener('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    })

    es.onerror = () => {
      es.close()
      esRef.current = null
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [isAuthenticated, accessToken, queryClient])
}
