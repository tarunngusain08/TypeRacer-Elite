package websocket

import (
	"sync"
)

type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Games maps game IDs to sets of clients
	Games map[string]map[*Client]bool

	// Register requests from the clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	// Broadcast channel for messages
	Broadcast chan Message

	// Mutex for thread-safe operations
	mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		Games:      make(map[string]map[*Client]bool),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan Message),
	}
}

func (h *Hub) BroadcastToGame(gameID string, message Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.Games[gameID]; ok {
		messageBytes := message.ToBytes()
		for client := range clients {
			select {
			case client.Send <- messageBytes:
			default:
				close(client.Send)
				delete(clients, client)
			}
		}
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if _, ok := h.Games[client.GameID]; !ok {
				h.Games[client.GameID] = make(map[*Client]bool)
			}
			h.Games[client.GameID][client] = true
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Games[client.GameID]; ok {
				if _, ok := h.Games[client.GameID][client]; ok {
					delete(h.Games[client.GameID], client)
					delete(h.clients, client)
					close(client.Send)
					if len(h.Games[client.GameID]) == 0 {
						delete(h.Games, client.GameID)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.RLock()
			messageBytes := message.ToBytes()
			for client := range h.clients {
				select {
				case client.Send <- messageBytes:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}
