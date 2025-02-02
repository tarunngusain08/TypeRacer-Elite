package websocket

import (
	"net/http"

	"github.com/gorilla/websocket"
)

// Upgrader is used to upgrade HTTP connections to WebSocket connections
var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // For development
	},
}

// UpgradeConnection upgrades an HTTP connection to a WebSocket connection
func UpgradeConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return Upgrader.Upgrade(w, r, nil)
}
