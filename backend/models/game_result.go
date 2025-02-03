package models

import (
	"time"
)

type GameResult struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	GameID    string    `json:"game_id"`
	UserID    string    `json:"user_id"`
	WPM       int       `json:"wpm"`
	Accuracy  float64   `json:"accuracy"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}
