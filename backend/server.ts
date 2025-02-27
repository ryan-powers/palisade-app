import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import sodium from 'libsodium-wrappers';
import { hashPhone } from './utils/phoneHash';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Function to generate a key pair
async function generateKeyPair() {
    await sodium.ready;
    const keyPair = sodium.crypto_box_keypair();
    return {
      publicKey: sodium.to_base64(keyPair.publicKey),
      privateKey: sodium.to_base64(keyPair.privateKey),
    };
  }

// Twilio Client Setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error("Twilio configuration is missing. Please check your environment variables.");
}

const twilioClient = twilio(accountSid, authToken);

fastify.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
});

// ✅ Send OTP to Phone
fastify.post('/send-otp', async (request, reply) => {
    const { phone } = request.body as { phone: string };
    if (!phone) return reply.status(400).send({ error: 'Phone number is required' });
  
    try {
      const verification = await twilioClient.verify.v2.services(verifyServiceSid)
        .verifications
        .create({ to: phone, channel: 'sms' });
  
      return reply.send({ message: 'OTP sent', sid: verification.sid });
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(500).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'An unknown error occurred' });
    }
  
});
  
// ✅ Verify OTP
fastify.post("/verify-otp", async (request, reply) => {
    const { phone, code } = request.body as { phone: string; code: string };
    if (!phone || !code) return reply.status(400).send({ error: "Phone and code are required" });
  
    try {
      const verificationCheck = await twilioClient.verify.v2.services(verifyServiceSid)
        .verificationChecks
        .create({ to: phone, code });
  
      if (verificationCheck.status === "approved") {
        const phoneHash = hashPhone(phone); // ✅ Generate a consistent hash
        console.log("Phone Hash (SHA-256):", phoneHash);
  
        // ✅ Find user by static phoneHash
        let user = await prisma.user.findUnique({
          where: { phoneHash }, // ✅ Now this works
        });
  
        if (!user) {
          const keyPair = await generateKeyPair();
  
          // ✅ Store public key for new users
          user = await prisma.user.create({
            data: { phoneHash, verified: true, publicKey: keyPair.publicKey },
          });
  
          return reply.send({
            message: "Phone verified",
            userId: user.id,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey, // ✅ Send private key to client
          });
        } else {
          await prisma.user.update({
            where: { phoneHash },
            data: { verified: true },
          });
  
          return reply.send({ message: "Phone verified", userId: user.id, publicKey: user.publicKey });
        }
      } else {
        return reply.status(400).send({ error: "Invalid OTP" });
      }
    } catch (error) {
      return reply.status(500).send({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
  
});

// ✅ Get User Public Key
fastify.get("/get-user-public-key", async (request, reply) => {
    const { userId } = request.query as { userId: string };

    if (!userId) {
        return reply.status(400).send({ error: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { publicKey: true },
    });

    if (!user || !user.publicKey) {
        return reply.status(404).send({ error: "Public key not found" });
    }

    return reply.send({ receiverPublicKey: user.publicKey }); // ✅ Standardized naming
});

// ✅ Set Display Name
fastify.post("/set-display-name", async (request, reply) => {
  const userId = request.headers["user-id"] as string;
  const { displayName } = request.body as { displayName: string };

  if (!userId || !displayName) {
    return reply.status(400).send({ 
      error: "User ID and display name are required",
      receivedUserId: userId,
      receivedDisplayName: displayName 
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });

    console.log("✅ Updated user:", updatedUser);
    return reply.send({ 
      message: "Display name updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    console.error("❌ Error updating display name:", error);
    return reply.status(500).send({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});


// ✅ Get Display Name
fastify.get("/get-display-name", async (request, reply) => {
  const userId = request.headers["user-id"] as string;

  if (!userId) {
      return reply.status(401).send({ error: "User ID is required" });
  }

  try {
      const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { displayName: true },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found." });
      }

      return reply.send({ displayName: user.displayName });
  } catch (error) {
      console.error("❌ Error retrieving display name:", error);
      return reply.status(500).send({ error: "Internal server error" });
  }
});

// ✅ Store Encrypted Messages Route (Place this here)
fastify.post('/send-message', async (request, reply) => {
    console.log("📩 Incoming request body:", request.body);

    const { senderId, receiverId, content, nonce } = request.body as { senderId: string; receiverId: string; content: string; nonce: string };

    if (!senderId || !receiverId || !content || !nonce) {
        console.error("❌ Missing required fields:", { senderId, receiverId, content, nonce });
        return reply.status(400).send({ error: "Missing required fields" });
    }

    try {
        const savedMessage = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content, // Store already encrypted content
                nonce,   // Store nonce for decryption
            },
        });

        console.log("✅ Message stored successfully:", savedMessage);
        return reply.send({ message: "Message sent", id: savedMessage.id });

    } catch (error) {
        console.error("❌ Database storage failed:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
});

// ✅ Get Messages
fastify.get("/get-messages", async (request, reply) => {
  const messages = await prisma.message.findMany({
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      content: true,  // Encrypted text
      nonce: true,    // Required for decryption
      sender: { select: { publicKey: true } }, // Fetch sender's public key
    },
  });

  return messages.map(msg => ({
    id: msg.id,
    senderId: msg.senderId,
    senderPublicKey: msg.sender.publicKey, // Send the sender's public key
    content: msg.content,
    nonce: msg.nonce,  // Include nonce for decryption
  }));
});
  


fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify with Twilio Verify!' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
    console.log('🚀 Fastify server running at http://localhost:4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

console.log('hashPhone function:', hashPhone);

start();






