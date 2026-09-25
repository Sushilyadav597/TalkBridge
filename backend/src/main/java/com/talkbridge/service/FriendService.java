package com.talkbridge.service;

import com.talkbridge.dto.FriendRequestDTO;
import com.talkbridge.dto.FriendshipDTO;
import com.talkbridge.entity.FriendRequest;
import com.talkbridge.entity.FriendRequestStatus;
import com.talkbridge.entity.Friendship;
import com.talkbridge.entity.User;
import com.talkbridge.exception.BadRequestException;
import com.talkbridge.exception.ResourceNotFoundException;
import com.talkbridge.repository.FriendRequestRepository;
import com.talkbridge.repository.FriendshipRepository;
import com.talkbridge.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public FriendService(
            FriendRequestRepository friendRequestRepository,
            FriendshipRepository friendshipRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.friendRequestRepository = friendRequestRepository;
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public FriendRequestDTO sendFriendRequest(User sender, Long receiverId) {
        if (sender.getId().equals(receiverId)) {
            throw new BadRequestException("You cannot send a friend request to yourself");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + receiverId));

        if (friendshipRepository.areFriends(sender, receiver)) {
            throw new BadRequestException("You are already friends with this user");
        }

        Optional<FriendRequest> existingPending = friendRequestRepository.findPendingBetweenUsers(sender, receiver);
        if (existingPending.isPresent()) {
            FriendRequest req = existingPending.get();
            if (req.getSender().getId().equals(sender.getId())) {
                throw new BadRequestException("Friend request already sent");
            } else {
                throw new BadRequestException("This user has already sent you a friend request. Please accept it instead.");
            }
        }

        // Check if there was an earlier non-pending request between the two
        Optional<FriendRequest> existing = friendRequestRepository.findBySenderAndReceiver(sender, receiver);
        FriendRequest request;
        if (existing.isPresent()) {
            request = existing.get();
            request.setStatus(FriendRequestStatus.PENDING);
        } else {
            request = new FriendRequest(sender, receiver);
        }

        FriendRequest saved = friendRequestRepository.save(request);
        FriendRequestDTO dto = FriendRequestDTO.fromEntity(saved);

        // Notify recipient in real time
        try {
            messagingTemplate.convertAndSendToUser(receiver.getEmail(), "/queue/messages", dto);
            messagingTemplate.convertAndSend("/topic/requests/" + receiver.getId(), dto);
        } catch (Exception e) {
            // Non-fatal if WebSocket broadcast fails
        }

        return dto;
    }

    @Transactional
    public FriendshipDTO acceptFriendRequest(User receiver, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new BadRequestException("You are not authorized to accept this friend request");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new BadRequestException("Friend request is not pending: " + request.getStatus());
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        User sender = request.getSender();
        FriendshipDTO result;
        if (!friendshipRepository.areFriends(sender, receiver)) {
            Friendship friendship = new Friendship(sender, receiver);
            Friendship saved = friendshipRepository.save(friendship);
            result = FriendshipDTO.fromEntity(saved, receiver.getId());
        } else {
            result = friendshipRepository.findBetweenUsers(sender, receiver)
                    .map(f -> FriendshipDTO.fromEntity(f, receiver.getId()))
                    .orElse(null);
        }

        // Notify sender that their request was accepted
        if (result != null) {
            try {
                messagingTemplate.convertAndSendToUser(sender.getEmail(), "/queue/messages", result);
                messagingTemplate.convertAndSend("/topic/requests/" + sender.getId(), result);
            } catch (Exception e) {
                // Non-fatal
            }
        }

        return result;
    }

    @Transactional
    public void rejectFriendRequest(User receiver, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new BadRequestException("You are not authorized to reject this friend request");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);
    }

    @Transactional
    public void cancelFriendRequest(User sender, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        if (!request.getSender().getId().equals(sender.getId())) {
            throw new BadRequestException("You are not authorized to cancel this friend request");
        }

        request.setStatus(FriendRequestStatus.CANCELLED);
        friendRequestRepository.save(request);
    }

    @Transactional
    public void removeFriend(User currentUser, Long friendId) {
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + friendId));

        friendshipRepository.findBetweenUsers(currentUser, friend).ifPresent(friendshipRepository::delete);
        friendRequestRepository.findBetweenUsers(currentUser, friend).ifPresent(friendRequestRepository::delete);
    }

    public List<FriendshipDTO> getFriends(User user) {
        return friendshipRepository.findAllByUser(user).stream()
                .map(f -> FriendshipDTO.fromEntity(f, user.getId()))
                .collect(Collectors.toList());
    }

    public List<FriendRequestDTO> getPendingReceivedRequests(User user) {
        return friendRequestRepository.findByReceiverAndStatus(user, FriendRequestStatus.PENDING).stream()
                .map(FriendRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<FriendRequestDTO> getPendingSentRequests(User user) {
        return friendRequestRepository.findBySenderAndStatus(user, FriendRequestStatus.PENDING).stream()
                .map(FriendRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public String getConnectionStatus(User currentUser, Long targetUserId) {
        if (currentUser.getId().equals(targetUserId)) {
            return "SELF";
        }
        User target = userRepository.findById(targetUserId).orElse(null);
        if (target == null) return "NONE";

        if (friendshipRepository.areFriends(currentUser, target)) {
            return "FRIENDS";
        }

        Optional<FriendRequest> pending = friendRequestRepository.findPendingBetweenUsers(currentUser, target);
        if (pending.isPresent()) {
            if (pending.get().getSender().getId().equals(currentUser.getId())) {
                return "PENDING_SENT";
            } else {
                return "PENDING_RECEIVED";
            }
        }
        return "NONE";
    }
}
