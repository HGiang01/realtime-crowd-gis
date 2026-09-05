package me.gianghn.realtimecrowdgis.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.gianghn.realtimecrowdgis.service.TokenService;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Slf4j
@Configuration
@EnableWebSocketMessageBroker // Message broker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final TokenService tokenService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Provide fallback transports if WebSocket is not available
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Channels broadcast from the server to the client will begin with "/topic".
        registry.enableSimpleBroker("/topic");

        // Messages sent from the client to the server (if any) will begin with "/app".
        registry.setApplicationDestinationPrefixes("/app");
    }
}
