package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/google/uuid"

	"typerace/models"
	ws "typerace/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // For development
	},
}

type GameHandler struct {
	hub   *ws.Hub
	games map[string]*models.Game
}

func NewGameHandler(hub *ws.Hub) *GameHandler {
	return &GameHandler{
		hub:   hub,
		games: make(map[string]*models.Game),
	}
}

func (h *GameHandler) CreateGame(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Text string `json:"text"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	gameID := uuid.New().String()
	game := models.NewGame(gameID, req.Text)
	h.games[gameID] = game

	json.NewEncoder(w).Encode(game)
}

func (h *GameHandler) GetGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	game, exists := h.games[gameID]
	if !exists {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(game)
}

func (h *GameHandler) JoinGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	var player models.Player
	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	game, exists := h.games[gameID]
	if !exists {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	if !game.AddPlayer(&player) {
		http.Error(w, "Game is full", http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(game)
}

func (h *GameHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["gameId"]

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	client := &ws.Client{
		Hub:    h.hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		GameID: gameID,
	}
	client.Hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}

// UpdateProgress handles updating a player's progress in the game
func (h *GameHandler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	var progressUpdate struct {
		PlayerID  string  `json:"playerId"`
		Progress  float64 `json:"progress"`
		WPM       int     `json:"wpm"`
		Accuracy  float64 `json:"accuracy"`
	}

	if err := json.NewDecoder(r.Body).Decode(&progressUpdate); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	game, exists := h.games[gameID]
	if !exists {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	game.Mu.Lock()
	for _, player := range game.Players {
		if player.ID == progressUpdate.PlayerID {
			player.Progress = progressUpdate.Progress
			player.WPM = progressUpdate.WPM
			player.Accuracy = progressUpdate.Accuracy

			// Create a game event
			event := models.GameEvent{
				Timestamp: time.Now(),
				PlayerID:  progressUpdate.PlayerID,
				Type:     "progress",
				Data:     progressUpdate,
			}
			game.ReplayData = append(game.ReplayData, event)
			break
		}
	}
	game.Mu.Unlock()

	// Broadcast progress update to all clients
	updateMsg, _ := json.Marshal(map[string]interface{}{
		"type": "progress",
		"data": progressUpdate,
	})
	h.broadcastToGame(gameID, updateMsg)

	w.WriteHeader(http.StatusOK)
}

// EndGame handles ending a game
func (h *GameHandler) EndGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	game, exists := h.games[gameID]
	if !exists {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	game.Mu.Lock()
	game.Status = models.Finished
	endTime := time.Now()
	game.ReplayData = append(game.ReplayData, models.GameEvent{
		Timestamp: endTime,
		Type:     "end",
		Data:     map[string]interface{}{"endTime": endTime},
	})
	game.Mu.Unlock()

	// Broadcast game end to all clients
	endMsg, _ := json.Marshal(map[string]interface{}{
		"type": "gameEnd",
		"data": game,
	})
	h.broadcastToGame(gameID, endMsg)

	json.NewEncoder(w).Encode(game)
}

// Helper method to broadcast messages to all clients in a game
func (h *GameHandler) broadcastToGame(gameID string, message []byte) {
	if gameClients, exists := h.hub.Games[gameID]; exists {
		for client := range gameClients {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(gameClients, client)
			}
		}
	}
}