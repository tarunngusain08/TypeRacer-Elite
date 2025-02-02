import { useEffect, useRef, useState } from "react"

interface WebSocketMessage {
  type: string
  payload: any
}

export function useWebSocket(gameId: string) {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [gameState, setGameState] = useState<any>(null)

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/api/ws/${gameId}`)

    ws.current.onopen = () => {
      setIsConnected(true)
    }

    ws.current.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      switch (message.type) {
        case "gameState":
          setGameState(message.payload)
          break
        // Handle other message types
      }
    }

    ws.current.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      ws.current?.close()
    }
  }, [gameId])

  const sendMessage = (type: string, payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }))
    }
  }

  return { isConnected, gameState, sendMessage }
}

