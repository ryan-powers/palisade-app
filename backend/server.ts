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

// ✅ Store Encrypted Messages Route (Place this here)
fastify.post("/send-message", async (request, reply) => {
    const { senderId, receiverId, encryptedMessage } = request.body;
    
    if (!senderId || !receiverId || !encryptedMessage) {
      return reply.status(400).send({ error: "Missing required fields" });
    }
  
    try {
        // ✅ Check if sender exists
        const sender = await prisma.user.findUnique({ where: { id: senderId } });
        if (!sender) return reply.status(400).send({ error: "Sender not found" });
    
        // ✅ Check if receiver exists
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) return reply.status(400).send({ error: "Receiver not found" });
    
        // ✅ Create encrypted message
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: encryptedMessage, // Store only encrypted content
          },
        });
  
      return reply.send({ message: "Message stored securely", messageId: message.id });
    } catch (error) {
      return reply.status(500).send({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
  });

fastify.get('/get-messages', async (request, reply) => {
    try {
      const messages = await prisma.message.findMany({
        orderBy: {
            createdAt: 'asc',
        },
    });

      return reply.send(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return reply.status(500).send({ error: "Failed to retrieve messages" });
    }
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



