package websocket

import "encoding/json"

// Message represents a WebSocket message with game context
type Message struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// Convert Message to bytes for sending
func (m Message) ToBytes() []byte {
	bytes, err := json.Marshal(m)
	if err != nil {
		return []byte{}
	}
	return bytes
}
