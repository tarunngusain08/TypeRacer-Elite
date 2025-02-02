package db

import (
	"fmt"
	"log"
	"os"

	"typerace/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDB() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@postgres:5432/typerace?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
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
