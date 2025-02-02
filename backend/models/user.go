package models

import (
    "time"
)

type User struct {
    ID            string    `json:"id"`
    Username      string    `json:"username"`
    Email         string    `json:"email"`
    PasswordHash  string    `json:"-"`
    Avatar        string    `json:"avatar"`
    TotalRaces    int       `json:"totalRaces"`
    AverageWPM    float64   `json:"averageWpm"`
    BestWPM       float64   `json:"bestWpm"`
    CreatedAt     time.Time `json:"createdAt"`
    UpdatedAt     time.Time `json:"updatedAt"`
}

type Achievement struct {
    ID          string    `json:"id"`
    UserID      string    `json:"userId"`
    Type        string    `json:"type"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    UnlockedAt  time.Time `json:"unlockedAt"`
}

type UserStats struct {
    TotalRaces      int     `json:"totalRaces"`
    WinsCount       int     `json:"winsCount"`
    AverageWPM      float64 `json:"averageWpm"`
    BestWPM         float64 `json:"bestWpm"`
    AverageAccuracy float64 `json:"averageAccuracy"`
    TotalTimePlayed int     `json:"totalTimePlayed"` // in minutes
}