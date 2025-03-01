package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Round struct {
	ID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	TournamentID uuid.UUID `gorm:"type:uuid" json:"tournament_id"`
	RoundNumber  int       `json:"roundNumber" gorm:"not null"`
	StartTime    time.Time `json:"startTime" gorm:"not null"`
	EndTime      time.Time `json:"endTime" gorm:"not null"`
	Participants []Player  `json:"participants" gorm:"many2many:round_participants;"`
	Games        []*Game   `json:"games" gorm:"foreignKey:RoundID"`
	Status       string    `json:"status" gorm:"default:'pending'"` // pending, active, completed
}

func (r *Round) BeforeCreate(tx *gorm.DB) (err error) {
	r.ID = uuid.New()
	return
}
