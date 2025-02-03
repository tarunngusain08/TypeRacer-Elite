package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	Username     string    `json:"username" gorm:"unique"`
	Email        string    `gorm:"unique;default:null"`
	PasswordHash string    `json:"-"`
	Avatar       string    `json:"avatar"`
	TotalRaces   int       `json:"totalRaces" gorm:"default:0"`
	AverageWPM   float64   `json:"averageWpm" gorm:"default:0"`
	BestWPM      float64   `json:"bestWpm" gorm:"default:0"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	// Username validation
	if len(u.Username) < 3 {
		return fmt.Errorf("username must be at least 3 characters")
	}

	// Check if username already exists (case insensitive)
	var count int64
	if err := tx.Model(&User{}).Where("LOWER(username) = LOWER(?)", u.Username).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("username already exists")
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
