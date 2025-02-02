package models

import (
    "time"
)

type Tournament struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    StartTime   time.Time `json:"startTime"`
    EndTime     time.Time `json:"endTime"`
    MaxPlayers  int       `json:"maxPlayers"`
    Status      string    `json:"status"` // pending, active, completed
    Rounds      []*Round  `json:"rounds"`
}

type Round struct {
    ID            string    `json:"id"`
    TournamentID  string    `json:"tournamentId"`
    RoundNumber   int       `json:"roundNumber"`
    StartTime     time.Time `json:"startTime"`
    EndTime       time.Time `json:"endTime"`
    Participants  []*User   `json:"participants"`
    Games         []*Game   `json:"games"`
}