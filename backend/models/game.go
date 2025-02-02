package models

import (
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GameStatus string

const (
	Waiting  GameStatus = "waiting"
	Playing  GameStatus = "playing"
	Finished GameStatus = "finished"
)

type Game struct {
	ID           uuid.UUID   `gorm:"type:uuid;primary_key;"`
	Status       GameStatus  `gorm:"type:varchar(20);not null"`
	Text         string      `gorm:"not null"`
	Players      []Player    `gorm:"many2many:game_players;"`
	ReplayData   []GameEvent `gorm:"type:jsonb"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Mu           sync.Mutex
	Category     string `json:"category"`
	Difficulty   string `json:"difficulty"`
	IsPrivate    bool   `json:"isPrivate"`
	Password     string `json:"-"`
	CreatedBy    string `json:"createdBy"`
	TournamentID string `json:"tournamentId,omitempty"`
}

type Player struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;"`
	UserID   uuid.UUID `gorm:"type:uuid;"`
	GameID   uuid.UUID `gorm:"type:uuid;"`
	Name     string    `json:"name"`
	Progress float64   `gorm:"default:0"`
	WPM      int       `gorm:"default:0"`
	Accuracy float64   `gorm:"default:0"`
	Avatar   string    `json:"avatar"`
}

type GameEvent struct {
	Timestamp time.Time `json:"timestamp"`
	PlayerID  string    `json:"playerId"`
	Type      string    `json:"type"`
	Data      any       `json:"data"`
}

func (g *Game) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}

func NewGame(id string, text string) *Game {
	uuid, err := uuid.Parse(id)
	if err != nil {
		log.Printf("Failed to parse game ID %s: %v", id, err)
		return nil
	}
	return &Game{
		ID:      uuid,
		Status:  Waiting,
		Text:    text,
		Players: make([]Player, 0),
	}
}

func (g *Game) AddPlayer(player *Player) bool {
	g.Mu.Lock()
	defer g.Mu.Unlock()

	if len(g.Players) >= 4 {
		return false
	}

	g.Players = append(g.Players, *player)
	return true
}

func (g *Game) Start() {
	g.Mu.Lock()
	defer g.Mu.Unlock()

	now := time.Now()
	g.CreatedAt = now
	g.Status = Playing
}
