package handlers

import (
	"encoding/json"
	"net/http"

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