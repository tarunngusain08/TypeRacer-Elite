import { useEffect, useRef, useState } from "react"
import { useToast } from "../contexts/ToastContext"

interface WebSocketMessage {
  type: string
  payload: any
}

export const useWebSocket = (gameId?: string) => {
  const ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [gameState, setGameState] = useState<any>(null)
  const { showToast } = useToast()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    try {
      // Use the correct WebSocket URL based on environment and gameId
      const baseWsUrl = import.meta.env.PROD
        ? `wss://${window.location.host}/api/ws`
        : `ws://${window.location.hostname}:8080/api/ws`;
      
      const wsUrl = gameId ? `${baseWsUrl}/${gameId}` : baseWsUrl;
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log("WebSocket Connected")
        setIsConnected(true)
        reconnectAttempts.current = 0
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          switch (message.type) {
            case "gameState":
              setGameState(message.payload)
              break
            case "error":
              showToast(message.payload.message, "error")
              break
            case "playerJoined":
            case "playerLeft":
            case "gameStarted":
            case "gameEnded":
              setGameState(message.payload)
              break
            default:
              console.log("Unhandled message type:", message.type)
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected")
        setIsConnected(false)
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1
          setTimeout(connect, 1000 * reconnectAttempts.current)
        } else {
          showToast("Connection lost. Please refresh the page.", "error")
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        if (isConnected) {
          showToast("Connection error. Attempting to reconnect...", "error")
        }
      }

    } catch (error) {
      console.error("WebSocket connection error:", error)
    }
  }

  useEffect(() => {
    connect()
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [gameId]) // Reconnect when gameId changes

  const sendMessage = (type: string, payload: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }))
    } else {
      showToast("Not connected to server", "error")
    }
  }

  return { isConnected, gameState, sendMessage }
}

