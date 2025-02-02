package models

import (
	"sync"
	"time"
)

type GameStatus string

const (
	Waiting  GameStatus = "waiting"
	Playing  GameStatus = "playing"
	Finished GameStatus = "finished"
)

type Game struct {
	ID        string      `json:"id"`
	Status    GameStatus  `json:"status"`
	Text      string      `json:"text"`
	StartTime *time.Time  `json:"startTime,omitempty"`
	Players   []*Player   `json:"players"`
	Mu        sync.Mutex
	Category    string      `json:"category"`
	Difficulty  string      `json:"difficulty"`
	IsPrivate   bool        `json:"isPrivate"`
	Password    string      `json:"-"`
	ReplayData  []GameEvent `json:"replayData,omitempty"`
	CreatedBy   string      `json:"createdBy"`
	TournamentID string     `json:"tournamentId,omitempty"`
}

type Player struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	WPM      int     `json:"wpm"`
	Accuracy float64 `json:"accuracy"`
	Progress float64 `json:"progress"`
	Avatar   string  `json:"avatar"`
}

type GameEvent struct {
	Timestamp time.Time `json:"timestamp"`
	PlayerID  string    `json:"playerId"`
	Type      string    `json:"type"` // progress, error, complete
	Data      any       `json:"data"`
}

func NewGame(id string, text string) *Game {
	return &Game{
		ID:      id,
		Status:  Waiting,
		Text:    text,
		Players: make([]*Player, 0),
	}
}

func (g *Game) AddPlayer(player *Player) bool {
	g.Mu.Lock()
	defer g.Mu.Unlock()

	if len(g.Players) >= 4 {
		return false
	}

	g.Players = append(g.Players, player)
	return true
}

func (g *Game) Start() {
	g.Mu.Lock()
	defer g.Mu.Unlock()

	now := time.Now()
	g.StartTime = &now
	g.Status = Playing
}