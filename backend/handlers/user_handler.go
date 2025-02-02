package handlers

import (
    "encoding/json"
    "net/http"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "golang.org/x/crypto/bcrypt"
    
    "typerace/models"
)

type UserHandler struct {
    users map[string]*models.User
}

func NewUserHandler() *UserHandler {
    return &UserHandler{
        users: make(map[string]*models.User),
    }
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Username string `json:"username"`
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Check if email already exists
    for _, user := range h.users {
        if user.Email == req.Email {
            http.Error(w, "Email already registered", http.StatusConflict)
            return
        }
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error creating user", http.StatusInternalServerError)
        return
    }

    now := time.Now()
    user := &models.User{
        ID:           uuid.New().String(),
        Username:     req.Username,
        Email:        req.Email,
        PasswordHash: string(hashedPassword),
        CreatedAt:    now,
        UpdatedAt:    now,
    }

    h.users[user.ID] = user

    // Don't send password hash in response
    json.NewEncoder(w).Encode(user)
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
    var user *models.User
    for _, u := range h.users {
        if u.Email == req.Email {
            user = u
            break
        }
    }

    if user == nil {
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
    vars := mux.Vars(r)
    userID := vars["id"]

    user, exists := h.users[userID]
    if !exists {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(user)
}