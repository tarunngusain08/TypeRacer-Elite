package db

import (
	"typerace/models"

	"log"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	log.Println("Starting database migration...")

	// Drop existing tables if they exist
	if err := db.Migrator().DropTable(&models.User{}, &models.Game{}, &models.Player{}, &models.Tournament{}); err != nil {
		log.Printf("Failed to drop tables: %v", err)
		// Continue even if drop fails
	}

	// Create tables with detailed logging
	tables := []interface{}{&models.User{}, &models.Game{}, &models.Player{}, &models.Tournament{}, &models.Round{}}
	for _, table := range tables {
		log.Printf("Attempting to migrate table for model: %T", table)

		// Check if table exists before migration
		if db.Migrator().HasTable(table) {
			log.Printf("Table for %T already exists", table)
		}

		if err := db.AutoMigrate(table); err != nil {
			log.Printf("Failed to auto migrate table %T: %v", table, err)
			return err
		}

		// Verify table was created
		if db.Migrator().HasTable(table) {
			log.Printf("Successfully verified table exists for %T", table)
		} else {
			log.Printf("WARNING: Table for %T was not created!", table)
		}
	}

	log.Println("Adding username index...")
	// Add case-insensitive unique index for username
	if err := db.Exec(`
		CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower 
		ON users(LOWER(username));
	`).Error; err != nil {
		log.Printf("Failed to create index: %v", err)
		return err
	}

	log.Println("Migration completed successfully")
	return nil
}
