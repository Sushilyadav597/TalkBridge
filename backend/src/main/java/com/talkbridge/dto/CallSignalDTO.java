package com.talkbridge.dto;

public class CallSignalDTO {
    public enum SignalType {
        CALL_REQUEST,
        CALL_ACCEPT,
        CALL_REJECT,
        CALL_END,
        OFFER,
        ANSWER,
        ICE_CANDIDATE
    }

    private SignalType type;
    private Long senderId;
    private String senderName;
    private Long recipientId;
    private Object payload; // Can hold SDP string or ICE Candidate object
    private String callType; // "video" or "audio"

    public CallSignalDTO() {
    }

    public CallSignalDTO(SignalType type, Long senderId, String senderName, Long recipientId, Object payload, String callType) {
        this.type = type;
        this.senderId = senderId;
        this.senderName = senderName;
        this.recipientId = recipientId;
        this.payload = payload;
        this.callType = callType;
    }

    public SignalType getType() {
        return type;
    }

    public void setType(SignalType type) {
        this.type = type;
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

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }
}
