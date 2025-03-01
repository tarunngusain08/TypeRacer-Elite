package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"context"
	"os"
	"time"
	"typerace/db"
	"typerace/handlers"
	"typerace/middleware"
	"typerace/websocket"

	"github.com/go-redis/redis/v8"
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
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:3001" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-user-id")
		w.Header().Set("Access-Control-Max-Age", "86400") // Cache preflight response for 1 day

		// Handle preflight request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		handler.ServeHTTP(w, r)
	})
}

var Ctx = context.Background()

// InitRedis initializes a new Redis client.
func InitRedis() *redis.Client {
	redisURL := os.Getenv("REDIS_URL")

	// In our docker-compose, REDIS_URL is like "redis:6379"
	opts := &redis.Options{
		Addr: redisURL,
	}

	client := redis.NewClient(opts)
	return client
}

// SetWithTTL stores a key with a TTL of one hour.
func SetWithTTL(client *redis.Client, key string, value interface{}) error {
	return client.Set(Ctx, key, value, time.Hour).Err()
}
