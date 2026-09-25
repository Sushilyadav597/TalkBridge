package com.talkbridge.service;

import com.talkbridge.dto.RecommendationDTO;
import com.talkbridge.dto.UserDTO;
import com.talkbridge.entity.FriendRequest;
import com.talkbridge.entity.FriendRequestStatus;
import com.talkbridge.entity.User;
import com.talkbridge.repository.FriendRequestRepository;
import com.talkbridge.repository.FriendshipRepository;
import com.talkbridge.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;

    public RecommendationService(
            UserRepository userRepository,
            FriendshipRepository friendshipRepository,
            FriendRequestRepository friendRequestRepository
    ) {
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
        this.friendRequestRepository = friendRequestRepository;
    }

    public List<RecommendationDTO> getRecommendationsForUser(User currentUser, int limit) {
        List<User> otherUsers = userRepository.findByIdNot(currentUser.getId());
        List<RecommendationDTO> recommendations = new ArrayList<>();

        for (User partner : otherUsers) {
            int score = 0;
            String reason;

            boolean complementary1 = partner.getNativeLanguage().equalsIgnoreCase(currentUser.getLearningLanguage());
            boolean complementary2 = partner.getLearningLanguage().equalsIgnoreCase(currentUser.getNativeLanguage());

            if (complementary1 && complementary2) {
                score += 80;
                reason = "Perfect Match: You teach " + currentUser.getNativeLanguage() + " & learn " + currentUser.getLearningLanguage() +
                         ", while they teach " + partner.getNativeLanguage() + " & learn " + partner.getLearningLanguage();
            } else if (complementary1) {
                score += 50;
                reason = "Native Speaker: Fluent in your target language " + currentUser.getLearningLanguage();
            } else if (complementary2) {
                score += 35;
                reason = "Language Learner: Wants to learn your native language " + currentUser.getNativeLanguage();
            } else if (partner.getLearningLanguage().equalsIgnoreCase(currentUser.getLearningLanguage())) {
                score += 25;
                reason = "Study Buddy: Both practicing " + currentUser.getLearningLanguage();
            } else {
                score += 15;
                reason = "Global Explorer: Interested in cross-cultural communication";
            }

            // Shared interests bonus
            List<String> mutualInterests = findMutualInterests(currentUser.getInterests(), partner.getInterests());
            score += Math.min(20, mutualInterests.size() * 10);
            if (!mutualInterests.isEmpty()) {
                reason += " • Shared interests: " + String.join(", ", mutualInterests);
            }

            // Check connection status
            String connectionStatus = "NONE";
            if (friendshipRepository.areFriends(currentUser, partner)) {
                connectionStatus = "FRIENDS";
            } else {
                Optional<FriendRequest> pending = friendRequestRepository.findPendingBetweenUsers(currentUser, partner);
                if (pending.isPresent()) {
                    if (pending.get().getSender().getId().equals(currentUser.getId())) {
                        connectionStatus = "PENDING_SENT";
                    } else {
                        connectionStatus = "PENDING_RECEIVED";
                    }
                }
            }

            recommendations.add(new RecommendationDTO(
                    UserDTO.fromEntity(partner),
                    score,
                    reason,
                    mutualInterests,
                    connectionStatus
            ));
        }

        // Sort by matchScore descending, then by online status
        recommendations.sort((a, b) -> {
            int scoreCompare = Integer.compare(b.getMatchScore(), a.getMatchScore());
            if (scoreCompare != 0) return scoreCompare;
            boolean aOnline = Boolean.TRUE.equals(a.getUser().getIsOnline());
            boolean bOnline = Boolean.TRUE.equals(b.getUser().getIsOnline());
            return Boolean.compare(bOnline, aOnline);
        });

        if (limit > 0 && recommendations.size() > limit) {
            return recommendations.subList(0, limit);
        }

        return recommendations;
    }

    private List<String> findMutualInterests(String interests1, String interests2) {
        if (interests1 == null || interests2 == null || interests1.isBlank() || interests2.isBlank()) {
            return Collections.emptyList();
        }

        Set<String> set1 = Arrays.stream(interests1.split("[,;]"))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        return Arrays.stream(interests2.split("[,;]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && set1.contains(s.toLowerCase()))
                .collect(Collectors.toList());
    }
}
