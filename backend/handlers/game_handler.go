package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"typerace/models"
	"typerace/websocket"
)

type GameHandler struct {
	Hub   *websocket.Hub          `json:"hub,omitempty"`
	db    *gorm.DB                `json:"db,omitempty"`
	redis *redis.Client           `json:"redis,omitempty"`
	Games map[string]*models.Game `json:"games,omitempty"`
}

func NewGameHandler(hub *websocket.Hub, db *gorm.DB, redis *redis.Client) *GameHandler {
	return &GameHandler{
		Hub:   hub,
		db:    db,
		redis: redis,
		Games: make(map[string]*models.Game),
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
	h.Games[gameID] = game

	json.NewEncoder(w).Encode(game)
}

func (h *GameHandler) GetGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	game, exists := h.Games[gameID]
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

	game, exists := h.Games[gameID]
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

	// Enable CORS for WebSocket
	websocket.Upgrader.CheckOrigin = func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	}

	conn, err := websocket.UpgradeConnection(w, r)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create new client with game ID
	client := &websocket.Client{
		Hub:    h.Hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		GameID: gameID,
	}

	// Register client with the hub
	h.Hub.Register <- client

	// Send initial game state if game exists
	if game, exists := h.Games[gameID]; exists {
		initialState, _ := json.Marshal(map[string]interface{}{
			"type":    "gameState",
			"payload": game,
		})
		client.Send <- initialState
	}

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}

// UpdateProgress handles updating a player's progress in the game
func (h *GameHandler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]
	userID := r.Header.Get("user_id")

	var req struct {
		Progress float64 `json:"progress"`
		WPM      int     `json:"wpm"`
		Accuracy float64 `json:"accuracy"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update game progress in Redis
	progressKey := fmt.Sprintf("game:%s:progress:%s", gameID, userID)
	err := h.redis.HSet(context.Background(), progressKey, map[string]interface{}{
		"progress": req.Progress,
		"wpm":      req.WPM,
		"accuracy": req.Accuracy,
	}).Err()

	if err != nil {
		log.Printf("Error updating progress: %v", err)
		http.Error(w, "Failed to update progress", http.StatusInternalServerError)
		return
	}

	// Broadcast progress update to all players
	h.Hub.BroadcastToGame(gameID, websocket.Message{
		Type: "progress_update",
		Data: map[string]interface{}{
			"user_id":  userID,
			"progress": req.Progress,
			"wpm":      req.WPM,
			"accuracy": req.Accuracy,
		},
	})

	w.WriteHeader(http.StatusOK)
}

// EndGame handles ending a game
func (h *GameHandler) EndGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	game, exists := h.Games[gameID]
	if !exists {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	game.Mu.Lock()
	game.Status = models.Finished
	endTime := time.Now()
	game.ReplayData = append(game.ReplayData, models.GameEvent{
		Timestamp: endTime,
		Type:      "end",
		Data:      map[string]interface{}{"endTime": endTime},
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
	if gameClients, exists := h.Hub.Games[gameID]; exists {
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
