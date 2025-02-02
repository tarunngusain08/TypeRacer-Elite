package handlers

import (
    "encoding/json"
    "net/http"
    "sort"

    // "typerace/models"
)

type LeaderboardHandler struct {
    gameHandler *GameHandler
}

func NewLeaderboardHandler() *LeaderboardHandler {
    return &LeaderboardHandler{}
}

type LeaderboardEntry struct {
    UserID    string  `json:"userId"`
    Username  string  `json:"username"`
    WPM       int     `json:"wpm"`
    Accuracy  float64 `json:"accuracy"`
    Wins      int     `json:"wins"`
}

func (h *LeaderboardHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
    // In a real application, this would fetch from a database
    // For now, we'll create some dummy data
    entries := []LeaderboardEntry{
        {
            UserID:    "1",
            Username:  "SpeedDemon",
            WPM:       120,
            Accuracy:  98.5,
            Wins:      10,
        },
        {
            UserID:    "2",
            Username:  "TypeMaster",
            WPM:       115,
            Accuracy:  97.8,
            Wins:      8,
        },
        // Add more entries as needed
    }

    // Sort by WPM (you could add different sorting options)
    sort.Slice(entries, func(i, j int) bool {
        return entries[i].WPM > entries[j].WPM
    })

    json.NewEncoder(w).Encode(entries)
}