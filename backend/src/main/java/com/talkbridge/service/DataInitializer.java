package com.talkbridge.service;

import com.talkbridge.entity.*;
import com.talkbridge.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            FriendRequestRepository friendRequestRepository,
            FriendshipRepository friendshipRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.friendshipRepository = friendshipRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        System.out.println(">>> Initializing TalkBridge seed data...");

        // 1. Create Users
        User sushil = createUser(
                "Sushil Yadav",
                "sushil@talkbridge.com",
                "password123",
                "Hindi",
                "English",
                "Full stack developer passionate about language exchange and cross-cultural communication.",
                "Programming, Tech, Movies, Traveling",
                "https://api.dicebear.com/7.x/initials/svg?seed=SY&backgroundColor=6366f1",
                Role.ROLE_ADMIN,
                true
        );

        User aditya = createUser(
                "Aditya Sharma",
                "aditya@talkbridge.com",
                "password123",
                "Hindi",
                "English",
                "Aspiring software engineer learning professional conversational English.",
                "Cricket, Web Dev, Music, Movies",
                "https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=3b82f6",
                Role.ROLE_USER,
                true
        );

        User arun = createUser(
                "Arun Pandey",
                "arun@talkbridge.com",
                "password123",
                "English",
                "Hindi",
                "Language enthusiast from California wanting to master conversational Hindi and explore Indian heritage.",
                "Languages, Indian Culture, Yoga, Traveling",
                "https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=10b981",
                Role.ROLE_USER,
                true
        );

        User priya = createUser(
                "Priya Singh",
                "priya@talkbridge.com",
                "password123",
                "Hindi",
                "Spanish",
                "Designer loving world languages and art. Preparing for a study trip to Spain.",
                "Art, Cooking, Photography, Spanish Literature",
                "https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=ec4899",
                Role.ROLE_USER,
                false
        );

        User rahul = createUser(
                "Rahul Kumar",
                "rahul@talkbridge.com",
                "password123",
                "English",
                "Hindi",
                "Tech consultant from London looking to practice daily Hindi greetings and expressions.",
                "Tech, Football, Philosophy, Reading",
                "https://api.dicebear.com/7.x/initials/svg?seed=RK&backgroundColor=8b5cf6",
                Role.ROLE_USER,
                false
        );

        User maria = createUser(
                "Maria Garcia",
                "maria@talkbridge.com",
                "password123",
                "Spanish",
                "English",
                "Architect from Madrid who loves exchanging culture, design concepts, and language nuances.",
                "Architecture, Cinema, Traveling, Cooking",
                "https://api.dicebear.com/7.x/initials/svg?seed=MG&backgroundColor=f59e0b",
                Role.ROLE_USER,
                true
        );

        User kenji = createUser(
                "Kenji Sato",
                "kenji@talkbridge.com",
                "password123",
                "Japanese",
                "English",
                "Game developer in Tokyo learning English for international gaming conferences.",
                "Gaming, Anime, Robotics, Tech",
                "https://api.dicebear.com/7.x/initials/svg?seed=KS&backgroundColor=06b6d4",
                Role.ROLE_USER,
                false
        );

        User elena = createUser(
                "Elena Rossi",
                "elena@talkbridge.com",
                "password123",
                "Italian",
                "Hindi",
                "Linguistics student from Rome fascinated by Sanskrit roots and modern Hindi cinema.",
                "Design, Opera, Philosophy, Bollywood, Movies",
                "https://api.dicebear.com/7.x/initials/svg?seed=ER&backgroundColor=14b8a6",
                Role.ROLE_USER,
                true
        );

        // 2. Create Friendships for Sushil
        friendshipRepository.save(new Friendship(sushil, aditya));
        friendshipRepository.save(new Friendship(sushil, rahul));

        // 3. Create Incoming Friend Request for Sushil (from Arun & Priya)
        FriendRequest req1 = new FriendRequest(arun, sushil);
        req1.setStatus(FriendRequestStatus.PENDING);
        friendRequestRepository.save(req1);

        FriendRequest req2 = new FriendRequest(priya, sushil);
        req2.setStatus(FriendRequestStatus.PENDING);
        friendRequestRepository.save(req2);

        // 4. Create Conversations and Messages
        createConversationWithMessages(
                sushil,
                aditya,
                "Hey! Are we still meeting today for language exchange?",
                "Yes absolutely! Let's do a 15-minute English/Hindi conversation session.",
                "Awesome! Let me know when you are ready to hop on the video call."
        );

        createConversationWithMessages(
                sushil,
                rahul,
                "Hi Sushil, I reviewed the grammar notes we practiced yesterday.",
                "Great job Rahul! Your pronunciation of formal Hindi verbs has improved a lot.",
                "Thanks! I've completed the project documentation as well."
        );

        System.out.println(">>> TalkBridge seed data successfully initialized!");
    }

    private User createUser(String name, String email, String password, String nativeLang, String learningLang,
                            String bio, String interests, String avatar, Role role, boolean isOnline) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setNativeLanguage(nativeLang);
        user.setLearningLanguage(learningLang);
        user.setBio(bio);
        user.setInterests(interests);
        user.setProfileImage(avatar);
        user.setRole(role);
        user.setIsOnline(isOnline);
        user.setLastSeen(LocalDateTime.now());
        return userRepository.save(user);
    }

    private void createConversationWithMessages(User u1, User u2, String msg1, String msg2, String msg3) {
        Conversation conv = new Conversation(u1, u2);
        conv.setLastMessage(msg3);
        conv.setLastMessageSenderId(u2.getId());
        conv.setLastMessageTime(LocalDateTime.now().minusMinutes(5));
        conv.setUpdatedAt(LocalDateTime.now().minusMinutes(5));
        conv = conversationRepository.save(conv);

        Message m1 = new Message(conv, u2, u1, msg1);
        m1.setTimestamp(LocalDateTime.now().minusHours(2));
        m1.setIsRead(true);
        messageRepository.save(m1);

        Message m2 = new Message(conv, u1, u2, msg2);
        m2.setTimestamp(LocalDateTime.now().minusHours(1));
        m2.setIsRead(true);
        messageRepository.save(m2);

        Message m3 = new Message(conv, u2, u1, msg3);
        m3.setTimestamp(LocalDateTime.now().minusMinutes(5));
        m3.setIsRead(false);
        messageRepository.save(m3);
    }
}
