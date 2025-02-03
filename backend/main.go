package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"

	"typerace/db"
	"typerace/handlers"
	"typerace/middleware"
	"typerace/websocket"
)

func main() {
	// Initialize database with auto-migration
	var database *gorm.DB
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

	// Auth routes
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("POST")
	api.HandleFunc("/auth/logout", authHandler.Logout).Methods("POST")
	api.HandleFunc("/auth/me", authHandler.GetMe).Methods("GET")
	api.HandleFunc("/auth/check-username/{username}", authHandler.CheckUsername).Methods("GET")

	// Game routes
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

	// Protected routes
	protected := api.PathPrefix("/").Subrouter()
	protected.Use(middleware.AuthMiddlewareHandler)
	protected.HandleFunc("/games", gameHandler.CreateGame).Methods("POST")
	protected.HandleFunc("/games/{id}/join", gameHandler.JoinGame).Methods("POST")

	// Wrap router with CORS middleware
	handler := setupCORS(router)

	// Start server
	log.Printf("Server starting on port :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func setupCORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler.ServeHTTP(w, r)
	})
}
