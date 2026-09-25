package com.talkbridge.dto;

import java.util.List;

public class RecommendationDTO {
    private UserDTO user;
    private int matchScore;
    private String matchReason;
    private List<String> mutualInterests;
    private String connectionStatus; // NONE, PENDING_SENT, PENDING_RECEIVED, FRIENDS

    public RecommendationDTO() {
    }

    public RecommendationDTO(UserDTO user, int matchScore, String matchReason, List<String> mutualInterests, String connectionStatus) {
        this.user = user;
        this.matchScore = matchScore;
        this.matchReason = matchReason;
        this.mutualInterests = mutualInterests;
        this.connectionStatus = connectionStatus;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public List<String> getMutualInterests() {
        return mutualInterests;
    }

    public void setMutualInterests(List<String> mutualInterests) {
        this.mutualInterests = mutualInterests;
    }

    public String getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(String connectionStatus) {
        this.connectionStatus = connectionStatus;
    }
}
