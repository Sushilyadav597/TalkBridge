package com.talkbridge.dto;

import com.talkbridge.entity.Message;
import java.time.LocalDateTime;

public class MessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private String recipientName;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isRead;

    public MessageDTO() {
    }

    public static MessageDTO fromEntity(Message message) {
        if (message == null) return null;
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        if (message.getConversation() != null) {
            dto.setConversationId(message.getConversation().getId());
        }
        if (message.getSender() != null) {
            dto.setSenderId(message.getSender().getId());
            dto.setSenderName(message.getSender().getName());
        }
        if (message.getRecipient() != null) {
            dto.setRecipientId(message.getRecipient().getId());
            dto.setRecipientName(message.getRecipient().getName());
        }
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsRead(message.getIsRead());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean read) {
        isRead = read;
    }
}
