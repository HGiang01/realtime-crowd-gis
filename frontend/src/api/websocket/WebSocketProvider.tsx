import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WebSocketContext } from "./WebSocketContext";
import axiosClient from "../axiosClient";

const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL;

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            reconnectDelay: 5000, // Auto reconnect after 5 seconds
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            beforeConnect: () => {
                const token = sessionStorage.getItem("access_token");
                client.connectHeaders = {
                    Authorization: token ? `Bearer ${token}` : "",
                };
            },

            onConnect: () => {
                setIsConnected(true);
                setStompClient(client);
                console.log("[STOMP] Connected to Realtime Services");
            },

            onStompError: (frame) => {
                const errorMsg = frame.headers["message"] || "";
                console.error("[STOMP] Broker error: ", errorMsg);

                // If the error is related to JWT or authentication, trigger a token refresh
                if (
                    errorMsg.includes("JWT") ||
                    errorMsg.includes("Expired") ||
                    errorMsg.includes("Authentication")
                ) {
                    console.log(
                        "[STOMP] Token issue detected, triggering refresh...",
                    );
                    // Refresh the token using Axios. The STOMP client will automatically reconnect after 5 seconds due to reconnectDelay.
                    axiosClient
                        .post("/auth/refresh", {}, { withCredentials: true })
                        .catch(() => {
                            console.error("Refresh failed. Redirect to login.");
                            window.location.href = "/login";
                        });
                }
            },

            onWebSocketClose: () => {
                setIsConnected(false);
                console.log(
                    "[STOMP] Connection closed, will auto-reconnect...",
                );
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ stompClient, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};
