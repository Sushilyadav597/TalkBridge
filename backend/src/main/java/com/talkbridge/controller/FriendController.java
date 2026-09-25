package com.talkbridge.controller;

import com.talkbridge.dto.FriendRequestDTO;
import com.talkbridge.dto.FriendshipDTO;
import com.talkbridge.entity.User;
import com.talkbridge.service.FriendService;
import com.talkbridge.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;
    private final UserService userService;

    public FriendController(FriendService friendService, UserService userService) {
        this.friendService = friendService;
        this.userService = userService;
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<FriendRequestDTO> sendFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId
    ) {
        User sender = userService.getEntityByEmail(userDetails.getUsername());
        FriendRequestDTO request = friendService.sendFriendRequest(sender, userId);
        return new ResponseEntity<>(request, HttpStatus.CREATED);
    }

    @PutMapping("/request/{requestId}/accept")
    public ResponseEntity<FriendshipDTO> acceptFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long requestId
    ) {
        User receiver = userService.getEntityByEmail(userDetails.getUsername());
        FriendshipDTO friendship = friendService.acceptFriendRequest(receiver, requestId);
        return ResponseEntity.ok(friendship);
    }

    @PutMapping("/request/{requestId}/reject")
    public ResponseEntity<Map<String, String>> rejectFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long requestId
    ) {
        User receiver = userService.getEntityByEmail(userDetails.getUsername());
        friendService.rejectFriendRequest(receiver, requestId);
        return ResponseEntity.ok(Map.of("message", "Friend request rejected"));
    }

    @DeleteMapping("/request/{requestId}/cancel")
    public ResponseEntity<Map<String, String>> cancelFriendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long requestId
    ) {
        User sender = userService.getEntityByEmail(userDetails.getUsername());
        friendService.cancelFriendRequest(sender, requestId);
        return ResponseEntity.ok(Map.of("message", "Friend request cancelled"));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Map<String, String>> removeFriend(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long friendId
    ) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        friendService.removeFriend(currentUser, friendId);
        return ResponseEntity.ok(Map.of("message", "Friend removed successfully"));
    }

    @GetMapping
    public ResponseEntity<List<FriendshipDTO>> getFriends(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        List<FriendshipDTO> friends = friendService.getFriends(currentUser);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<List<FriendRequestDTO>> getPendingReceivedRequests(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        List<FriendRequestDTO> requests = friendService.getPendingReceivedRequests(currentUser);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequestDTO>> getPendingSentRequests(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        List<FriendRequestDTO> requests = friendService.getPendingSentRequests(currentUser);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, String>> getConnectionStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId
    ) {
        User currentUser = userService.getEntityByEmail(userDetails.getUsername());
        String status = friendService.getConnectionStatus(currentUser, userId);
        return ResponseEntity.ok(Map.of("status", status));
    }
}
