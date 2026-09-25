package com.talkbridge.repository;

import com.talkbridge.entity.FriendRequest;
import com.talkbridge.entity.FriendRequestStatus;
import com.talkbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequestStatus status);

    List<FriendRequest> findBySenderAndStatus(User sender, FriendRequestStatus status);

    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.sender = :user1 AND fr.receiver = :user2) " +
           "OR (fr.sender = :user2 AND fr.receiver = :user1)")
    Optional<FriendRequest> findBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT fr FROM FriendRequest fr WHERE ((fr.sender = :user1 AND fr.receiver = :user2) " +
           "OR (fr.sender = :user2 AND fr.receiver = :user1)) AND fr.status = 'PENDING'")
    Optional<FriendRequest> findPendingBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
}
