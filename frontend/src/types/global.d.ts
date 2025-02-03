declare global {
  interface Window {
    gameSocket: WebSocket | null; // Adjust the type as needed
  }
}

export {}; 