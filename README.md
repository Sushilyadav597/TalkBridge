# 🌉 TalkBridge – Language Exchange & Communication Platform

TalkBridge is a **production-ready Java Full Stack platform** connecting language learners and native speakers across the globe. Built with **Spring Boot 3, Spring Security, JWT, JPA/Hibernate, MySQL 8, WebSocket (STOMP), WebRTC, and React 19**, TalkBridge provides intelligent language-partner recommendations, real-time messaging, bilateral friendships, and peer-to-peer HD video calling.

---

## 🚀 Key Highlights & Architecture

```text
React 19 Frontend (Port 5173)
       │
       ├── REST API (HTTP/JSON with JWT Bearer) ──► Spring Boot 3 Backend (Port 8080)
       │                                                     │
       ├── WebSocket (STOMP over SockJS) ────────────► Spring WebSocket Broker
       │                                                     │
       └── WebRTC P2P Signaling ─────────────────────► Spring Data JPA / Hibernate
                                                             │
                                                      MySQL 8 Database (Port 3306)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, JavaScript (ES6+), React Router v7, HTML5, CSS3, StompJS, SockJS, WebRTC APIs |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring MVC, Spring Data JPA, Hibernate, Spring Security 6, JWT (JJWT 0.12.6), WebSocket (STOMP) |
| **Database** | MySQL 8.0 (Primary) / H2 in-memory profile (Optional Standalone) |
| **Real-Time** | STOMP Message Broker (`/ws-talkbridge`), RTCPeerConnection for WebRTC 1-on-1 audio/video |
| **Build Tools** | Apache Maven 3.9, Vite 8, npm 10 |

---

## 📁 Project Structure

```text
TalkBridge/
├── backend/
│   ├── src/main/java/com/talkbridge/
│   │   ├── config/
│   │   │   ├── WebConfig.java             # CORS & MVC configuration
│   │   │   └── WebSocketConfig.java       # STOMP Broker & SockJS endpoints
│   │   ├── controller/
│   │   │   ├── AuthController.java        # Register, Login, Logout
│   │   │   ├── UserController.java        # Profile, search, password change
│   │   │   ├── FriendController.java      # Requests, friendships, bilateral connections
│   │   │   ├── ChatController.java        # Conversations, messages, STOMP mappings
│   │   │   ├── RecommendationController.java # Scored partner suggestions
│   │   │   └── CallSignalingController.java  # WebRTC SDP/ICE exchange
│   │   ├── dto/                           # Data Transfer Objects
│   │   ├── entity/
│   │   │   ├── User.java                  # User profile, languages, interests, role
│   │   │   ├── FriendRequest.java         # PENDING, ACCEPTED, REJECTED, CANCELLED
│   │   │   ├── Friendship.java            # Bilateral active friendships
│   │   │   ├── Conversation.java          # One-to-one chat rooms
│   │   │   └── Message.java               # Message persistence with read tracking
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java # Standardized RFC-7807 error responses
│   │   │   ├── BadRequestException.java
│   │   │   └── ResourceNotFoundException.java
│   │   ├── repository/                    # Spring Data JPA Repositories
│   │   ├── security/
│   │   │   ├── JwtService.java            # HS256 Token generator & validator
│   │   │   ├── JwtAuthenticationFilter.java # OncePerRequest token filter
│   │   │   ├── CustomUserDetails.java
│   │   │   └── SecurityConfig.java        # Stateless Spring Security filter chain
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── UserService.java
│   │   │   ├── FriendService.java
│   │   │   ├── ChatService.java
│   │   │   ├── RecommendationService.java # Language pairing algorithm
│   │   │   └── DataInitializer.java       # Automatic seed data loader
│   │   └── TalkBridgeApplication.java
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Top bar with notifications & user status
│   │   │   ├── Sidebar.jsx                # Responsive drawer navigation
│   │   │   ├── UserCard.jsx               # Partner card with compatibility badge
│   │   │   ├── Button.jsx                 # Reusable buttons with loading state
│   │   │   ├── Modal.jsx                  # Accessible glassmorphic dialogs
│   │   │   ├── Loader.jsx                 # Animated pulse spinner
│   │   │   ├── ProtectedRoute.jsx         # Auth guard redirecting to /login
│   │   │   └── IncomingCallModal.jsx      # Global WebRTC call alert popup
│   │   ├── context/
│   │   │   ├── AuthContext.jsx            # Authentication state & session manager
│   │   │   └── WebSocketContext.jsx       # STOMP broker listener & WebRTC signaling
│   │   ├── pages/
│   │   │   ├── Login.jsx                  # Split-card sign in with demo accounts
│   │   │   ├── Register.jsx               # Language preference registration
│   │   │   ├── Dashboard.jsx              # Welcome banner, stats, recs, recent chats
│   │   │   ├── Discover.jsx               # Global partner search & language filtering
│   │   │   ├── Friends.jsx                # Active connections with 1-click chat/call
│   │   │   ├── FriendRequests.jsx         # Received & sent request management
│   │   │   ├── Chat.jsx                   # Real-time WebSocket messenger
│   │   │   ├── VideoCall.jsx              # WebRTC video call with local PiP & controls
│   │   │   └── Profile.jsx                # Profile editor, password change & preferences
│   │   ├── services/                      # Modular API clients
│   │   ├── App.jsx                        # Routes configuration
│   │   ├── main.jsx
│   │   └── index.css                      # Design system & CSS variables
│   ├── package.json
│   └── vite.config.js                     # Proxy configured to backend
│
├── database-schema.sql                    # MySQL 8 table definitions
├── start-all.bat                          # One-click startup script
├── start-backend.bat
└── start-frontend.bat
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Java 21 LTS** installed
- **Node.js 18+ / 22+** installed
- **MySQL 8.0** installed

### 1. Launching with Convenience Scripts (Windows)
Double-click `start-all.bat` or run:
```powershell
.\start-all.bat
```
This automatically verifies MySQL, starts the Spring Boot backend on `http://localhost:8080`, and starts the React frontend on `http://localhost:5173`.

### 2. Manual Startup
**Backend**:
```powershell
cd backend
mvn spring-boot:run
```

**Frontend**:
```powershell
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Seeded Test Accounts

The backend includes a `DataInitializer` that seeds realistic international users upon first startup:

| Name | Email | Password | Native Language | Learning Language | Role |
|---|---|---|---|---|---|
| **Sushil Yadav** | `sushil@talkbridge.com` | `password123` | Hindi | English | ADMIN |
| **Arun Pandey** | `arun@talkbridge.com` | `password123` | English | Hindi | USER |
| **Aditya Sharma** | `aditya@talkbridge.com` | `password123` | Hindi | English | USER |
| **Maria Garcia** | `maria@talkbridge.com` | `password123` | Spanish | English | USER |
| **Elena Rossi** | `elena@talkbridge.com` | `password123` | Italian | Hindi | USER |
| **Kenji Sato** | `kenji@talkbridge.com` | `password123` | Japanese | English | USER |

> 💡 **Tip:** On the Login page, use the **Quick Demo Login** buttons to sign in as Sushil or Arun with a single click!

---

## 📡 REST API Reference

### 🔐 Authentication
- `POST /api/auth/register` – Register new user account.
- `POST /api/auth/login` – Authenticate with email/password; returns JWT token and UserDTO.
- `POST /api/auth/logout` – Invalidate current session and set online status to false.

### 👤 User Management
- `GET /api/users/me` – Retrieve current authenticated user profile.
- `PUT /api/users/me` – Update profile details (name, bio, languages, interests, avatar).
- `PUT /api/users/change-password` – Update user password with current password verification.
- `DELETE /api/users/me` – Delete user account and cascade delete related data.
- `GET /api/users/{id}` – View profile of another user.
- `GET /api/users?search={query}` – Search all users by name, language, or interests.

### 🎯 Language Partner Recommendations
- `GET /api/recommendations?limit=10` – Returns scored partner recommendations based on language compatibility:
  - **Perfect Match (80-100 pts):** User A native == User B learning AND User A learning == User B native.
  - **Native Speaker (50-70 pts):** Target language spoken natively by partner.
  - **Shared Interests (+10 pts each):** Matching hobby/interest tags.

### 🤝 Friends & Requests
- `POST /api/friends/request/{userId}` – Send friend request.
- `PUT /api/friends/request/{requestId}/accept` – Accept request & create bilateral friendship.
- `PUT /api/friends/request/{requestId}/reject` – Reject friend request.
- `DELETE /api/friends/request/{requestId}/cancel` – Cancel sent request.
- `DELETE /api/friends/{friendId}` – Remove friend.
- `GET /api/friends` – List accepted friends.
- `GET /api/friends/requests/pending` – List received pending requests.
- `GET /api/friends/requests/sent` – List sent pending requests.
- `GET /api/friends/status/{userId}` – Check connection state (`FRIENDS`, `PENDING_SENT`, `PENDING_RECEIVED`, `NONE`).

### 💬 Real-Time Chat & Conversations
- `GET /api/conversations` – List all user conversations with last message and unread count.
- `POST /api/conversations/start/{partnerId}` – Get or create conversation with partner.
- `GET /api/conversations/{id}/messages` – Fetch chronological chat history.
- `POST /api/conversations/{id}/messages` – Send message in conversation (triggers STOMP broadcast).
- `POST /api/conversations/send-direct` – Send direct message to a user.
- `PUT /api/conversations/{id}/read` – Mark messages as read.

### 📹 WebRTC Video Calling & Signaling
- `POST /api/call/signal` – REST signaling fallback for `OFFER`, `ANSWER`, `ICE_CANDIDATE`, `CALL_END`.
- WebSocket STOMP endpoint `/app/call.signal` – Broadcasts to `/topic/call/{recipientId}`.

---

## 🗄️ Database Design

```sql
users                friend_requests          friendships          conversations          messages
─────                ───────────────          ───────────          ─────────────          ────────
id (PK)              id (PK)                  id (PK)              id (PK)                id (PK)
name                 sender_id (FK)           user1_id (FK)        user1_id (FK)          conversation_id (FK)
email (Unique)       receiver_id (FK)         user2_id (FK)        user2_id (FK)          sender_id (FK)
password (BCrypt)    status                   created_at           last_message           recipient_id (FK)
native_language      created_at                                    last_message_time      content
learning_language    updated_at                                    updated_at             timestamp
is_online                                                                                 is_read
```

---

## 📱 Responsive Testing
The TalkBridge frontend is tested and responsive across:
- **Mobile (320px, 375px, 480px)**: Collapsible sidebar drawer, responsive cards, full-width messenger.
- **Tablet (768px)**: 2-column grids, optimized touch targets.
- **Desktop (1024px, 1200px, 1440px+)**: Multi-column dashboard, side-by-side conversation list and active chat.

---

## 🏆 Production-Ready Checklist
- [x] Java 21 LTS with Spring Boot 3.3.4
- [x] BCrypt password encryption & stateless JWT authentication filter
- [x] Complete REST API endpoints with HTTP status codes and error responses
- [x] Real-time STOMP WebSocket messaging
- [x] WebRTC peer-to-peer 1-on-1 audio/video calling with media controls
- [x] Language matching and recommendation scoring algorithm
- [x] MySQL 8.0 schema and auto-initialization
- [x] React 19 single-page app with clean architecture, CSS variables, and zero console errors
