package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;"`
	Username     string    `gorm:"unique;not null"`
	Email        string    `gorm:"unique;not null"`
	PasswordHash string    `gorm:"not null"`
	Avatar       string    `json:"avatar"`
	TotalRaces   int       `json:"totalRaces"`
	AverageWPM   float64   `json:"averageWpm"`
	BestWPM      float64   `json:"bestWpm"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Achievement struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;"`
	UserID      uuid.UUID `gorm:"type:uuid;"`
	Type        string    `json:"type"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	UnlockedAt  time.Time `json:"unlockedAt"`
}
