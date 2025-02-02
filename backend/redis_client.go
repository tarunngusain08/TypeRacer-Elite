package main

import (
	"context"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

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

