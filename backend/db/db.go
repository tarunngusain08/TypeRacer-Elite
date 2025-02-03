package db

import (
	"fmt"
	"log"
	"os"

	"typerace/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dbURL := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"))

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	if err := AutoMigrate(db); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %v", err)
	}

	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Add models here
	err := db.AutoMigrate(
		&models.User{},
		&models.Game{},
		&models.Player{},
	)

	if err != nil {
		log.Printf("Error during migration: %v", err)
		return err
	}

	log.Println("Database migration completed successfully")
	return nil
}
