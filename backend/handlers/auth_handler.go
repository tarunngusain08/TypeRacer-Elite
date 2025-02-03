package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"typerace/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		db: db,
	}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func generateTokenPair(user *models.User, secret string) (*TokenPair, error) {
	// Access token - short lived (15 minutes)
	accessToken := jwt.New(jwt.SigningMethodHS256)
	accessClaims := accessToken.Claims.(jwt.MapClaims)
	accessClaims["user_id"] = user.ID
	accessClaims["username"] = user.Username
	accessClaims["exp"] = time.Now().Add(time.Minute * 15).Unix()

	accessTokenString, err := accessToken.SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	// Refresh token - long lived (7 days)
	refreshToken := jwt.New(jwt.SigningMethodHS256)
	refreshClaims := refreshToken.Claims.(jwt.MapClaims)
	refreshClaims["user_id"] = user.ID
	refreshClaims["exp"] = time.Now().Add(time.Hour * 24 * 7).Unix()

	refreshTokenString, err := refreshToken.SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode request body: %v", err)
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate input
	if len(strings.TrimSpace(req.Username)) < 3 {
		log.Printf("Username too short: %s", req.Username)
		http.Error(w, "Username must be at least 3 characters long", http.StatusBadRequest)
		return
	}

	if len(req.Password) < 6 {
		log.Printf("Password too short for user: %s", req.Username)
		http.Error(w, "Password must be at least 6 characters long", http.StatusBadRequest)
		return
	}

	// Check if username exists (case insensitive)
	var existingUser models.User
	if err := h.db.Where("LOWER(username) = LOWER(?)", req.Username).First(&existingUser).Error; err == nil {
		log.Printf("Username already exists: %s", req.Username)
		http.Error(w, "Username already taken", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create user
	user := &models.User{
		ID:           uuid.New().String(),
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.db.Create(user).Error; err != nil {
		log.Printf("Failed to create user: %v", err)
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			http.Error(w, "Username already taken", http.StatusConflict)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Generate tokens
	tokens, err := generateTokenPair(user, "your-secret-key") // Use env variable in production
	if err != nil {
		log.Printf("Failed to generate tokens: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return success response
	response := map[string]interface{}{
		"message": "Registration successful",
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
		},
		"tokens": tokens,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	log.Printf("Successfully registered user: %s", user.Username)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var user models.User
	if result := h.db.Where("username = ?", req.Username).First(&user); result.Error != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	tokens, err := generateTokenPair(&user, "your-secret-key") // Use env variable in production
	if err != nil {
		http.Error(w, "Error generating tokens", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	token, err := jwt.Parse(req.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte("your-secret-key"), nil // Use env variable in production
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	claims := token.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	var user models.User
	if result := h.db.First(&user, "id = ?", userID); result.Error != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	newTokens, err := generateTokenPair(&user, "your-secret-key")
	if err != nil {
		http.Error(w, "Error generating tokens", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"tokens": newTokens,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// For token-based auth, client-side should remove the token
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("user_id")
	if userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user models.User
	if result := h.db.First(&user, "id = ?", userID); result.Error != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Don't send password hash in response
	user.PasswordHash = ""

	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) CheckUsername(w http.ResponseWriter, r *http.Request) {
	username := mux.Vars(r)["username"]

	var existingUser models.User
	exists := h.db.Where("LOWER(username) = LOWER(?)", username).First(&existingUser).Error == nil

	json.NewEncoder(w).Encode(map[string]bool{
		"exists": exists,
	})
}
