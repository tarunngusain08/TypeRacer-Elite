package websocket

import (
	"sync"
)

type Hub struct {
	// Registered clients by game ID
	Games map[string]map[*Client]bool

	// Inbound messages from the clients
	Broadcast chan *Message

	// Register requests from the clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan *Message),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Games:      make(map[string]map[*Client]bool),
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
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Games[client.GameID]; ok {
				if _, ok := h.Games[client.GameID][client]; ok {
					delete(h.Games[client.GameID], client)
					close(client.Send)
					if len(h.Games[client.GameID]) == 0 {
						delete(h.Games, client.GameID)
					}
				}
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.RLock()
			if clients, ok := h.Games[message.GameID]; ok {
				for client := range clients {
					select {
					case client.Send <- message.Content:
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}
