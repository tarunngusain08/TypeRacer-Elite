package websocket

// Message represents a WebSocket message with game context
type Message struct {
	GameID  string
	Content []byte
}
