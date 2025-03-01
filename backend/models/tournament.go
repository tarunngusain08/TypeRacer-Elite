package models

import (
	"time"
)

type Tournament struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"startTime" gorm:"not null"`
	EndTime     time.Time `json:"endTime" gorm:"not null"`
	MaxPlayers  int       `json:"maxPlayers" gorm:"not null"`
	Status      string    `json:"status" gorm:"default:'pending'"` // pending, active, completed
	Rounds      []*Round  `json:"rounds" gorm:"foreignKey:TournamentID"`
}
