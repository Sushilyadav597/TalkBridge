package com.talkbridge.repository;

import com.talkbridge.entity.Conversation;
import com.talkbridge.entity.Message;
import com.talkbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderByTimestampAsc(Conversation conversation);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.recipient = :user AND m.isRead = false")
    int countUnreadMessages(@Param("conversation") Conversation conversation, @Param("user") User user);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation = :conversation AND m.recipient = :user AND m.isRead = false")
    void markConversationMessagesAsRead(@Param("conversation") Conversation conversation, @Param("user") User user);
}
