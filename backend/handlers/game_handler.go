package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"typerace/models"
	ws "typerace/websocket"
	"typerace/redisclient"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // For development
	},
}

// GameHandler now contains connections to DB and Redis and no longer stores games in memory.
type GameHandler struct {
	hub         *ws.Hub
	db          *sql.DB
	redisClient *redis.Client
}

// NewGameHandler returns a handler with DB and redis attached.
func NewGameHandler(hub *ws.Hub, db *sql.DB, redisClient *redis.Client) *GameHandler {
	return &GameHandler{
		hub:         hub,
		db:          db,
		redisClient: redisClient,
	}
}

// CreateGame creates a new game and saves to Postgres and Redis.
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

	// Save game to Postgres. (Assumes you have a table "games")
	_, err := h.db.Exec(`INSERT INTO games (id, text, status, created_at) VALUES ($1, $2, $3, $4)`,
		game.ID, game.Text, game.Status, time.Now())
	if err != nil {
		http.Error(w, "DB Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Cache game JSON in Redis with 1 hour TTL.
	gameJSON, _ := json.Marshal(game)
	h.redisClient.Set(redisclient.Ctx, "game:"+gameID, gameJSON, time.Hour)

	json.NewEncoder(w).Encode(game)
}

// GetGame retrieves game details first from Redis cache then falls back to Postgres.
func (h *GameHandler) GetGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	// Try to get game from Redis.
	cached, err := h.redisClient.Get(redisclient.Ctx, "game:"+gameID).Result()
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(cached))
		return
	}

	// Fall back to Postgres if cache miss.
	row := h.db.QueryRow(`SELECT id, text, status FROM games WHERE id=$1`, gameID)
	var game models.Game
	if err := row.Scan(&game.ID, &game.Text, &game.Status); err != nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	// Cache in Redis again.
	gameJSON, _ := json.Marshal(game)
	h.redisClient.Set(redisclient.Ctx, "game:"+gameID, gameJSON, time.Hour)

	json.NewEncoder(w).Encode(game)
}

// JoinGame adds a player to the game and updates the game in DB and Redis.
func (h *GameHandler) JoinGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	var player models.Player
	if err := json.NewDecoder(r.Body).Decode(&player); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real application, join logic would update the participant list in a separate table.
	// For demo purposes, we retrieve game from cache (or Postgres) and update its players.
	var game models.Game
	cached, err := h.redisClient.Get(redisclient.Ctx, "game:"+gameID).Result()
	if err == nil {
		json.Unmarshal([]byte(cached), &game)
	} else {
		row := h.db.QueryRow(`SELECT id, text, status FROM games WHERE id=$1`, gameID)
		if err := row.Scan(&game.ID, &game.Text, &game.Status); err != nil {
			http.Error(w, "Game not found", http.StatusNotFound)
			return
		}
	}

	if !game.AddPlayer(&player) {
		http.Error(w, "Game is full", http.StatusBadRequest)
		return
	}

	// Update game in Redis (and optionally update Postgres as needed)
	gameJSON, _ := json.Marshal(game)
	h.redisClient.Set(redisclient.Ctx, "game:"+gameID, gameJSON, time.Hour)

	json.NewEncoder(w).Encode(game)
}

// HandleWebSocket upgrades to a websocket session.
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

// UpdateProgress updates a player’s progress.
func (h *GameHandler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	var progressUpdate struct {
		PlayerID string  `json:"playerId"`
		Progress float64 `json:"progress"`
		WPM      int     `json:"wpm"`
		Accuracy float64 `json:"accuracy"`
	}

	if err := json.NewDecoder(r.Body).Decode(&progressUpdate); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Retrieve game from cache (or Postgres)
	var game models.Game
	cached, err := h.redisClient.Get(redisclient.Ctx, "game:"+gameID).Result()
	if err == nil {
		json.Unmarshal([]byte(cached), &game)
	} else {
		row := h.db.QueryRow(`SELECT id, text, status FROM games WHERE id=$1`, gameID)
		if err := row.Scan(&game.ID, &game.Text, &game.Status); err != nil {
			http.Error(w, "Game not found", http.StatusNotFound)
			return
		}
	}

	// Update local game state (this example uses the in-model lock and replayData)
	game.Mu.Lock()
	for _, player := range game.Players {
		if player.ID == progressUpdate.PlayerID {
			player.Progress = progressUpdate.Progress
			player.WPM = progressUpdate.WPM
			player.Accuracy = progressUpdate.Accuracy
			// Append a game event
			event := models.GameEvent{
				Timestamp: time.Now(),
				PlayerID:  progressUpdate.PlayerID,
				Type:      "progress",
				Data:      progressUpdate,
			}
			game.ReplayData = append(game.ReplayData, event)
			break
		}
	}
	game.Mu.Unlock()

	// Update cache with latest game state.
	gameJSON, _ := json.Marshal(game)
	h.redisClient.Set(redisclient.Ctx, "game:"+gameID, gameJSON, time.Hour)

	// Broadcast update to websocket clients.
	updateMsg, _ := json.Marshal(map[string]interface{}{
		"type": "progress",
		"data": progressUpdate,
	})
	h.broadcastToGame(gameID, updateMsg)

	w.WriteHeader(http.StatusOK)
}

// EndGame marks a game as finished.
func (h *GameHandler) EndGame(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	gameID := vars["id"]

	var game models.Game

	// Try to get game from cache.
	cached, err := h.redisClient.Get(redisclient.Ctx, "game:"+gameID).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(cached), &game); err != nil {
			http.Error(w, "Error reading cached game data", http.StatusInternalServerError)
			return
		}
	} else {
		// Fallback: retrieve game from DB.
		row := h.db.QueryRow(`SELECT id, text, status FROM games WHERE id=$1`, gameID)
		if err := row.Scan(&game.ID, &game.Text, &game.Status); err != nil {
			http.Error(w, "Game not found", http.StatusNotFound)
			return
		}
	}

	// End the game.
	game.Mu.Lock()
	game.Status = models.Finished
	endTime := time.Now()
	game.ReplayData = append(game.ReplayData, models.GameEvent{
		Timestamp: endTime,
		Type:      "end",
		Data:      map[string]interface{}{"endTime": endTime},
	})
	game.Mu.Unlock()

	// Update cache.
	gameJSON, err := json.Marshal(game)
	if err != nil {
		http.Error(w, "Error marshaling game data", http.StatusInternalServerError)
		return
	}
	h.redisClient.Set(redisclient.Ctx, "game:"+gameID, gameJSON, time.Hour)

	// Broadcast finish event.
	endMsg, err := json.Marshal(map[string]interface{}{
		"type": "gameEnd",
		"data": game,
	})
	if err != nil {
		http.Error(w, "Error marshaling end message", http.StatusInternalServerError)
		return
	}
	h.broadcastToGame(gameID, endMsg)

	// Return the updated game as response.
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(game); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
}