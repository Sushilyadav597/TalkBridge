package com.talkbridge.dto;

import com.talkbridge.entity.Friendship;
import com.talkbridge.entity.User;
import java.time.LocalDateTime;

public class FriendshipDTO {
    private Long id;
    private UserDTO friend;
    private LocalDateTime createdAt;

    public FriendshipDTO() {
    }

    public static FriendshipDTO fromEntity(Friendship friendship, Long currentUserId) {
        if (friendship == null) return null;
        FriendshipDTO dto = new FriendshipDTO();
        dto.setId(friendship.getId());
        User friendUser = friendship.getUser1().getId().equals(currentUserId)
                ? friendship.getUser2()
                : friendship.getUser1();
        dto.setFriend(UserDTO.fromEntity(friendUser));
        dto.setCreatedAt(friendship.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getFriend() {
        return friend;
    }

    public void setFriend(UserDTO friend) {
        this.friend = friend;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
