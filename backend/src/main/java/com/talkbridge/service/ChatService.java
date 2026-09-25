package com.talkbridge.service;

import com.talkbridge.dto.ConversationDTO;
import com.talkbridge.dto.MessageDTO;
import com.talkbridge.dto.UserDTO;
import com.talkbridge.entity.Conversation;
import com.talkbridge.entity.Message;
import com.talkbridge.entity.User;
import com.talkbridge.exception.BadRequestException;
import com.talkbridge.exception.ResourceNotFoundException;
import com.talkbridge.repository.ConversationRepository;
import com.talkbridge.repository.MessageRepository;
import com.talkbridge.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Conversation getOrCreateConversation(User user1, User user2) {
        if (user1.getId().equals(user2.getId())) {
            throw new BadRequestException("Cannot create a conversation with yourself");
        }

        return conversationRepository.findBetweenUsers(user1, user2)
                .orElseGet(() -> {
                    Conversation conv = new Conversation(user1, user2);
                    conv.setUpdatedAt(LocalDateTime.now());
                    return conversationRepository.save(conv);
                });
    }

    @Transactional
    public ConversationDTO getOrCreateConversationDTO(User currentUser, Long partnerId) {
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + partnerId));

        Conversation conversation = getOrCreateConversation(currentUser, partner);
        return toConversationDTO(conversation, currentUser);
    }

    public List<ConversationDTO> getUserConversations(User currentUser) {
        List<Conversation> conversations = conversationRepository.findAllByUserOrderByUpdatedAtDesc(currentUser);
        List<ConversationDTO> dtos = new ArrayList<>();

        for (Conversation c : conversations) {
            dtos.add(toConversationDTO(c, currentUser));
        }

        return dtos;
    }

    public List<MessageDTO> getConversationMessages(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getUser1().getId().equals(currentUser.getId()) &&
            !conversation.getUser2().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You are not part of this conversation");
        }

        return messageRepository.findByConversationOrderByTimestampAsc(conversation).stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDTO sendMessage(Long conversationId, User sender, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getUser1().getId().equals(sender.getId()) &&
            !conversation.getUser2().getId().equals(sender.getId())) {
            throw new BadRequestException("You are not part of this conversation");
        }

        User recipient = conversation.getUser1().getId().equals(sender.getId())
                ? conversation.getUser2()
                : conversation.getUser1();

        Message message = new Message(conversation, sender, recipient, content.trim());
        Message savedMessage = messageRepository.save(message);

        // Update conversation last message
        conversation.setLastMessage(content.trim());
        conversation.setLastMessageSenderId(sender.getId());
        conversation.setLastMessageTime(savedMessage.getTimestamp());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        MessageDTO messageDTO = MessageDTO.fromEntity(savedMessage);

        // Broadcast via WebSocket
        try {
            // 1. To topic for active room participants
            messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, messageDTO);
            // 2. To recipient's personal queue
            messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/messages", messageDTO);
        } catch (Exception e) {
            // Log but don't fail the REST transaction
        }

        return messageDTO;
    }

    @Transactional
    public MessageDTO sendMessageToUser(User sender, Long recipientId, String content) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + recipientId));

        Conversation conversation = getOrCreateConversation(sender, recipient);
        return sendMessage(conversation.getId(), sender, content);
    }

    @Transactional
    public void markMessagesAsRead(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        messageRepository.markConversationMessagesAsRead(conversation, currentUser);
    }

    private ConversationDTO toConversationDTO(Conversation conversation, User currentUser) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());

        User partner = conversation.getUser1().getId().equals(currentUser.getId())
                ? conversation.getUser2()
                : conversation.getUser1();

        dto.setPartner(UserDTO.fromEntity(partner));
        dto.setLastMessage(conversation.getLastMessage());
        dto.setLastMessageSenderId(conversation.getLastMessageSenderId());
        dto.setLastMessageTime(conversation.getLastMessageTime());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        dto.setUnreadCount(messageRepository.countUnreadMessages(conversation, currentUser));

        return dto;
    }
}
