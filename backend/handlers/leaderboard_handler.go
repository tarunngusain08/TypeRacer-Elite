package handlers

import (
	"encoding/json"
	"net/http"

	// "typerace/models"
	"gorm.io/gorm"
)

type LeaderboardHandler struct {
	db *gorm.DB
}

func NewLeaderboardHandler(db *gorm.DB) *LeaderboardHandler {
	return &LeaderboardHandler{
		db: db,
	}
}

type LeaderboardEntry struct {
	UserID   string  `json:"userId"`
	Username string  `json:"username"`
	WPM      int     `json:"wpm"`
	Accuracy float64 `json:"accuracy"`
	Wins     int     `json:"wins"`
}

func (h *LeaderboardHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	var entries []LeaderboardEntry

	// Query the database for all users and their stats
	rows, err := h.db.Raw(`
        SELECT 
            u.id as user_id,
            u.username,
            AVG(p.wpm) as avg_wpm,
            AVG(p.accuracy) as avg_accuracy,
            COUNT(CASE WHEN p.wpm = (
                SELECT MAX(p2.wpm) 
                FROM players p2 
                WHERE p2.game_id = p.game_id
            ) THEN 1 END) as wins
        FROM users u
        LEFT JOIN players p ON p.user_id = u.id 
        GROUP BY u.id, u.username
        ORDER BY avg_wpm DESC
        LIMIT 100
    `).Rows()

	if err != nil {
		http.Error(w, "Error fetching leaderboard data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var entry LeaderboardEntry
		err := rows.Scan(&entry.UserID, &entry.Username, &entry.WPM, &entry.Accuracy, &entry.Wins)
		if err != nil {
			http.Error(w, "Error scanning leaderboard data", http.StatusInternalServerError)
			return
		}
		entries = append(entries, entry)
	}

	json.NewEncoder(w).Encode(entries)
}
