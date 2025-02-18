import * as dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';



const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

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
  if (!phone) return reply.status(400).send({ error: "Phone number is required" });

  try {
    const verification = await twilioClient.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: phone, channel: "sms" });

    return reply.send({ message: "OTP sent", sid: verification.sid });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(500).send({ error: error.message });
    }
    return reply.status(500).send({ error: "An unknown error occurred" });
  }
});

// ✅ Verify OTP
fastify.post('/verify-otp', async (request, reply) => {
  const { phone, code } = request.body as { phone: string; code: string };
  if (!phone || !code) return reply.status(400).send({ error: "Phone and code are required" });

  try {
    const verificationCheck = await twilioClient.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: phone, code });

    if (verificationCheck.status === "approved") {
      // Check if user exists in DB
      let user = await prisma.user.findUnique({ where: { phone } });

      // If user does not exist, create one
      if (!user) {
        user = await prisma.user.create({
          data: { phone, verified: true },
        });
      } else {
        await prisma.user.update({
          where: { phone },
          data: { verified: true },
        });
      }

      return reply.send({ message: "Phone verified", userId: user.id });
    } else {
      return reply.status(400).send({ error: "Invalid OTP" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(500).send({ error: error.message });
    }
    return reply.status(500).send({ error: "An unknown error occurred" });
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

start();



