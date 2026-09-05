import { createContext, useContext } from "react";
import type { Client } from "@stomp/stompjs";

export interface WebSocketContextType {
    stompClient: Client | null;
    isConnected: boolean;
}

// Context for WebSocket connection state and client
export const WebSocketContext = createContext<WebSocketContextType>({
    stompClient: null,
    isConnected: false,
});

export const useWebSocketContext = () => useContext(WebSocketContext);
