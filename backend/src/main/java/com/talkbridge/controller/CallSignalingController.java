package com.talkbridge.controller;

import com.talkbridge.dto.CallSignalDTO;
import com.talkbridge.entity.User;
import com.talkbridge.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class CallSignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    public CallSignalingController(SimpMessagingTemplate messagingTemplate, UserService userService) {
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
    }

    // STOMP WebSocket endpoint for low-latency WebRTC signaling
    @MessageMapping("/call.signal")
    public void handleCallSignal(@Payload CallSignalDTO signal) {
        if (signal == null || signal.getRecipientId() == null) {
            return;
        }

        // Forward to recipient's channel
        messagingTemplate.convertAndSend("/topic/call/" + signal.getRecipientId(), signal);
    }

    // REST signaling fallback for HTTP clients
    @PostMapping("/api/call/signal")
    public ResponseEntity<Map<String, Object>> sendSignalViaRest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CallSignalDTO signal
    ) {
        User sender = userService.getEntityByEmail(userDetails.getUsername());
        signal.setSenderId(sender.getId());
        signal.setSenderName(sender.getName());

        // Forward through WebSocket broker
        messagingTemplate.convertAndSend("/topic/call/" + signal.getRecipientId(), signal);

        return ResponseEntity.ok(Map.of("success", true, "deliveredTo", signal.getRecipientId()));
    }
}
