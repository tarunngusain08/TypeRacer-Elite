package db

import (
	"log"
	"os"

	"typerace/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=typerace port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto Migrate
	err = autoMigrate(db)
	if err != nil {
		return nil, err
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
