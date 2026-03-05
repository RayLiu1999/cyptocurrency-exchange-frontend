const WS_URL = "ws://localhost:8080/ws";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
    this.isConnected = false;
  }

  connect() {
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log("✅ WebSocket Connected");
      this.isConnected = true;
      this.notifyListeners({ type: "system_connection", isConnected: true });
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.notifyListeners(message);
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    this.socket.onclose = () => {
      console.log("❌ WebSocket Disconnected");
      this.isConnected = false;
      this.notifyListeners({ type: "system_connection", isConnected: false });
      // 自動重連
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect();
        }
      }, 3000);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((listener) => listener(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
