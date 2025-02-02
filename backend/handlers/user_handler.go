package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"typerace/models"
)

type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		db: db,
	}
}

type CreateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserResponse struct {
	ID         string  `json:"id"`
	Username   string  `json:"username"`
	Email      string  `json:"email"`
	Avatar     string  `json:"avatar"`
	TotalRaces int     `json:"totalRaces"`
	AverageWPM float64 `json:"averageWpm"`
	BestWPM    float64 `json:"bestWpm"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Generate UUID and convert to string
	userID := uuid.New().String()

	// Check if email already exists
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err == nil {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	now := time.Now()
	user = models.User{
		ID:           userID,
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := h.db.Create(&user).Error; err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	response := UserResponse{
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Avatar:     user.Avatar,
		TotalRaces: user.TotalRaces,
		AverageWPM: user.AverageWPM,
		BestWPM:    user.BestWPM,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Find user by email
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// In a real application, you would generate a JWT token here
	// For now, we'll just return the user
	json.NewEncoder(w).Encode(user)
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("id")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	var user models.User
	if result := h.db.First(&user, "id = ?", userID); result.Error != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	response := UserResponse{
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Avatar:     user.Avatar,
		TotalRaces: user.TotalRaces,
		AverageWPM: user.AverageWPM,
		BestWPM:    user.BestWPM,
	}

	json.NewEncoder(w).Encode(response)
}
