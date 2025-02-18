**Secure workspace app with E2EE. Re-build of secure-chat prototype.** 

# **Palisade Prototype**

## Overview
Palisade is a secure team chat application that bridges the gap between enterprise-focused platforms like Mattermost and minimalist messengers like Signal. Designed for small to mid-sized teams, activist groups, journalists, and NGOs, it offers an intuitive, privacy-first communication experience with essential organizational tools. By prioritizing end-to-end encryption (E2EE) and a lightweight architecture, this platform ensures secure collaboration without enterprise-level complexity.

## Use Case / Value Proposition
### **Primary Users:**
- **Activist and NGO Groups:** Need secure, private, and organized communication without relying on corporate-owned platforms.
- **Journalists & Investigators:** Require E2EE messaging for confidential discussions and source protection.
- **Startups & Small Teams:** Want an alternative to Slack/Mattermost that offers privacy without an overwhelming feature set.
- **Remote & Distributed Teams:** Need an intuitive tool for real-time collaboration with a strong mobile experience.

### **Key Benefits:**
1. **Security & Privacy by Default**
   - End-to-end encryption enabled on all messages and file transfers.
   - No metadata logging—ensuring minimal data exposure.
   
2. **Simplified Collaboration**
   - Threaded discussions, channels, and direct messaging for team communication.
   - Basic project management features without unnecessary complexity.
   
3. **User-Friendly & Lightweight**
   - Clean and intuitive UI optimized for quick adoption.
   - Mobile-first approach for teams that work on the go.

4. **Easy Deployment & Open Source**
   - Self-hosting options with simple setup, supporting teams who prefer data control.
   - Open-source core for transparency and community contributions.

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
A server is still needed for user management, workspace organization, and metadata handling, but all messages are encrypted client-side.

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

### **End-to-End Encryption (E2EE)**
🔐 The Signal Protocol (used in WhatsApp, Signal, and Session) is the best option for E2EE messaging. It provides:
- Double Ratchet Algorithm for forward secrecy
- Prekeys to allow offline message sending
- Sealed Sender to hide metadata from even the server

**Implementation:**
- Use libsignal-client in both frontend and backend (for handling keys).
- Store only public keys in the database.
- Encrypt all message contents client-side before sending.
- Store messages encrypted on the server (zero-knowledge model).

## Future Roadmap
- **Voice & Video Calls with E2EE** (Phase 2)
- **Ephemeral Messages & Self-Destructing Chats**
- **Federation Support for Interoperability**
- **Integration with Secure Cloud Storage Solutions**
- **Secure File Storage, Management, and Editing**

Palisade is built to empower teams that prioritize security and usability, offering a compelling alternative to both enterprise-heavy and consumer-centric chat platforms.


