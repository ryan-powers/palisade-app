**Secure workspace app with E2EE. Re-build of secure-chat prototype.** 

# **Palisade Prototype**

## Tech Stack Overview
### **Frontend (Client)**
- **Framework:** Next.js (for SSR & static generation where useful)
- **UI Library:** Tailwind CSS (for styling)
- **State Management:** Zustand or Recoil (lightweight over Redux)
- **WebSockets:** Socket.IO or WebTransport (for real-time messaging)
- **Encryption:**
  - Signal Protocol (libsignal-client) for E2EE chat
  - WebCrypto API for local encryption
- **Push Notifications:** Firebase Cloud Messaging (FCM) for web & mobile

### **Backend**

- **Server Framework:** Node.js with Fastify (lightweight & fast)
- **Database:**
  - PostgreSQL (with Prisma ORM) for structured data (user metadata, workspaces)
  - SQLite (optional for local storage in certain use cases)
- **Real-time Communication:**
  - WebSockets (NestJS Gateway / Socket.IO) for chat updates
  - Redis (Pub/Sub) for scaling real-time events
- **Authentication:**
  - Twilio Verify or Authy for SMS-based login
  - Use Magic Links as an alternative backup
- **Encryption:**
  - libsignal-client (Rust-based binding for Signal Protocol) for end-to-end encryption
  - NaCl / libsodium for metadata encryption (protects user/workspace names)
  - Vault (HashiCorp) for key management (if needed)



