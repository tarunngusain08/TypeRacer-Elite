package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"

	"typerace/db"
	"typerace/handlers"
	"typerace/middleware"
	"typerace/websocket"
)

func main() {
	// Initialize database with auto-migration
	database, err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Redis
	redisClient := InitRedis()

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize handlers with database connection
	gameHandler := handlers.NewGameHandler(hub, database, redisClient)
	userHandler := handlers.NewUserHandler(database)
	leaderboardHandler := handlers.NewLeaderboardHandler(database)
	authHandler := handlers.NewAuthHandler(database)

	// API Routes
	router := mux.NewRouter()
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
	api.HandleFunc("/users/{id}", userHandler.GetUser).Methods("GET")

	// Auth routes
	api.HandleFunc("/auth/register", authHandler.Register).Methods("POST")
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("POST")

	// Protected routes
	protected := api.PathPrefix("/").Subrouter()
	protected.Use(middleware.AuthMiddlewareHandler)
	protected.HandleFunc("/auth/me", authHandler.GetMe).Methods("GET")
	protected.HandleFunc("/games", gameHandler.CreateGame).Methods("POST")
	protected.HandleFunc("/games/{id}/join", gameHandler.JoinGame).Methods("POST")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:      []string{"http://localhost:3000"},
		AllowedMethods:      []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:      []string{"*"},
		AllowCredentials:    true,
		AllowPrivateNetwork: true,
	})

	// Start server
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(port, c.Handler(router)))
}
