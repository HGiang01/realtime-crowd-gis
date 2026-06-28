import { useEffect } from "react";
import type { IMessage } from "@stomp/stompjs";
import { useWebSocketContext } from "../api/websocket/WebSocketContext";

// Custom hook for subscribing to a STOMP topic and automatically unsubscribing on component unmount
export const useStompSubscription = <T>(
    topic: string,
    callback: (message: T) => void,
) => {
    const { stompClient, isConnected } = useWebSocketContext();

    useEffect(() => {
        if (isConnected && stompClient) {
            const subscription = stompClient.subscribe(
                topic,
                (message: IMessage) => {
                    try {
                        const parsedBody = JSON.parse(message.body) as T;
                        callback(parsedBody);
                    } catch {
                        callback(message.body as unknown as T);
                    }
                },
            );

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [isConnected, stompClient, topic, callback]);
};
