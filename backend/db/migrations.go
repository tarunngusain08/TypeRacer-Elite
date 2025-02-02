package db

import (
	"typerace/models"

	"log"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	// Drop existing tables if they exist
	if err := db.Migrator().DropTable(&models.User{}); err != nil {
		log.Printf("Failed to drop tables: %v", err)
		// Continue even if drop fails
	}

	// Create tables
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Printf("Failed to auto migrate: %v", err)
		return err
	}

	// Add case-insensitive unique index for username
	if err := db.Exec(`
		CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower 
		ON users(LOWER(username));
	`).Error; err != nil {
		log.Printf("Failed to create index: %v", err)
		return err
	}

	return nil
}
