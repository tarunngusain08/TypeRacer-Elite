package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"typerace/handlers"
	"typerace/websocket"
)

func main() {
	// Initialize router and hub
	router := mux.NewRouter()
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize handlers
	gameHandler := handlers.NewGameHandler(hub)
	userHandler := handlers.NewUserHandler()
	leaderboardHandler := handlers.NewLeaderboardHandler()

	// API Routes
	api := router.PathPrefix("/api").Subrouter()
	
	// Existing routes
	api.HandleFunc("/games", gameHandler.CreateGame).Methods("POST")
	api.HandleFunc("/games/{id}", gameHandler.GetGame).Methods("GET")
	api.HandleFunc("/games/{id}/join", gameHandler.JoinGame).Methods("POST")
	api.HandleFunc("/ws/{gameId}", gameHandler.HandleWebSocket)

	// New routes
	api.HandleFunc("/games/{id}/progress", gameHandler.UpdateProgress).Methods("POST")
	api.HandleFunc("/games/{id}/end", gameHandler.EndGame).Methods("POST")
	api.HandleFunc("/leaderboard", leaderboardHandler.GetLeaderboard).Methods("GET")
	
	// User management routes
	api.HandleFunc("/users", userHandler.CreateUser).Methods("POST")
	api.HandleFunc("/login", userHandler.Login).Methods("POST")
	api.HandleFunc("/users/{id}", userHandler.GetUser).Methods("GET")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// Start server
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(port, c.Handler(router)))
}