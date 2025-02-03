package db

import (
	"errors"
	"log"

	"typerace/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Database struct {
	*gorm.DB
}

func InitDB() (*Database, error) {
	dsn := "host=db user=postgres password=postgres dbname=typeracer port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto Migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Game{}, &models.GameResult{})
	if err != nil {
		return nil, err
	}

	return &Database{db}, nil
}

func (db *Database) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	result := db.Where("username = ?", username).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, result.Error
	}
	return &user, nil
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
