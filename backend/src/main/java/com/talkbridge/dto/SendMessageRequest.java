package com.talkbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SendMessageRequest {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotBlank(message = "Message content cannot be empty")
    private String content;

    public SendMessageRequest() {
    }

    public SendMessageRequest(Long recipientId, String content) {
        this.recipientId = recipientId;
        this.content = content;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
