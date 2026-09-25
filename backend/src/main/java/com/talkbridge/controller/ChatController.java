package com.talkbridge.controller;

import com.talkbridge.dto.ConversationDTO;
import com.talkbridge.dto.MessageDTO;
import com.talkbridge.dto.SendMessageRequest;
import com.talkbridge.entity.User;
import com.talkbridge.service.ChatService;
import com.talkbridge.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping("/api/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        List<ConversationDTO> conversations = chatService.getUserConversations(currentUser);
        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/api/conversations/start/{partnerId}")
    public ResponseEntity<ConversationDTO> startConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long partnerId
    ) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        ConversationDTO conversation = chatService.getOrCreateConversationDTO(currentUser, partnerId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long conversationId
    ) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        List<MessageDTO> messages = chatService.getConversationMessages(conversationId, currentUser);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long conversationId,
            @RequestBody Map<String, String> body
    ) {
        User sender = userService.getEntityByEmail(userDetails.getUsername());
        String content = body.get("content");
        MessageDTO message = chatService.sendMessage(conversationId, sender, content);
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @PostMapping("/api/conversations/send-direct")
    public ResponseEntity<MessageDTO> sendDirectMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SendMessageRequest request
    ) {
        User sender = userService.getEntityByEmail(userDetails.getUsername());
        MessageDTO message = chatService.sendMessageToUser(sender, request.getRecipientId(), request.getContent());
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @PutMapping("/api/conversations/{conversationId}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long conversationId
    ) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        chatService.markMessagesAsRead(conversationId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }

    // STOMP WebSocket Message Mapping
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(@Payload SendMessageRequest payload) {
        if (payload != null && payload.getRecipientId() != null && payload.getContent() != null) {
            // Note: For authenticated STOMP sessions, the sender can be extracted or provided
            // Handled in tandem with REST fallback for guaranteed delivery
        }
    }
}
