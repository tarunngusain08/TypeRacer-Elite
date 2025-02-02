export const connectWebSocket = (gameId: string) => {
  const ws = new WebSocket(`ws://localhost:8080/api/ws/${gameId}`);
  
  ws.onopen = () => {
    console.log('WebSocket Connected');
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  return ws;
}; 