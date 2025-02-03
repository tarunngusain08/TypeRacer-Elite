package redis

import (
	"context"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var Ctx = context.Background()

func InitRedis() *redis.Client {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: redisHost,
	})

	return client
}

func Set(client *redis.Client, key string, value interface{}) error {
	return client.Set(Ctx, key, value, time.Hour).Err()
}
