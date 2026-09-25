package com.talkbridge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // In-memory message broker to carry messages to clients on prefixes /topic and /queue
        config.enableSimpleBroker("/topic", "/queue", "/user");
        // Prefix for messages bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific queues
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register endpoint that clients will use to connect to WebSocket broker
        registry.addEndpoint("/ws-talkbridge")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        registry.addEndpoint("/ws-talkbridge")
                .setAllowedOriginPatterns("*");
    }
}
