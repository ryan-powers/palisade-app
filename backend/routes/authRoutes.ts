import * as dotenv from 'dotenv';
dotenv.config();

import { FastifyInstance } from 'fastify';
import twilio from 'twilio';
import { hashPhone } from '../utils/phoneHash';
import { generateKeyPair } from '../utils/keyGen';
import prisma from '../prisma/client';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const twilioClient = twilio(accountSid, authToken);

if (!accountSid || !authToken || !verifyServiceSid) {
    console.error("❌ Twilio Configuration Missing!");
    console.error("TWILIO_ACCOUNT_SID:", accountSid);
    console.error("TWILIO_AUTH_TOKEN:", authToken);
    console.error("TWILIO_VERIFY_SERVICE_SID:", verifyServiceSid);
    throw new Error("Twilio environment variables missing. Check your .env file.");
  }

export async function authRoutes(fastify: FastifyInstance) {
    // ✅ Send OTP
    fastify.post("/send-otp", async (request, reply) => {
      const { phone } = request.body as { phone: string };
      if (!phone) return reply.status(400).send({ error: "Phone number is required" });
  
      try {
        const verification = await twilioClient.verify.v2.services(verifyServiceSid)
          .verifications.create({ to: phone, channel: "sms" });
  
        return reply.send({ message: "OTP sent", sid: verification.sid });
      } catch (error) {
        return reply.status(500).send({ error: error instanceof Error ? error.message : "Unknown error" });
      }
    });
  
    // ✅ Verify OTP
    fastify.post("/verify-otp", async (request, reply) => {
        console.log("📨 Received request to verify OTP:", request.body);
    
        const { phone, code } = request.body as { phone: string; code: string };
        if (!phone || !code) {
            console.error("❌ Missing phone or code!");
            return reply.status(400).send({ error: "Phone and code are required" });
        }
    
        try {
            const verificationCheck = await twilioClient.verify.v2.services(verifyServiceSid)
                .verificationChecks.create({ to: phone, code });
    
            console.log("✅ Twilio Verification Response:", verificationCheck);
    
            if (verificationCheck.status === "approved") {
                const phoneHash = hashPhone(phone);
                console.log("🔑 Generated Phone Hash:", phoneHash);
    
                let user = await prisma.user.findUnique({ where: { phoneHash } });
                console.log("👤 User found in DB:", user);
    
                if (!user) {
                    console.log("🚀 Creating new user...");
                    const keyPair = await generateKeyPair();
    
                    user = await prisma.user.create({
                        data: { phoneHash, verified: true, publicKey: keyPair.publicKey },
                    });
    
                    console.log("✅ New User Created:", user);
                    return reply.send({
                        message: "Phone verified",
                        userId: user.id,
                        publicKey: keyPair.publicKey,
                        privateKey: keyPair.privateKey,
                    });
                } else {
                    console.log("✅ Existing user found, updating verification status...");
                    await prisma.user.update({
                        where: { phoneHash },
                        data: { verified: true },
                    });
    
                    return reply.send({
                        message: "Phone verified",
                        userId: user.id,
                        publicKey: user.publicKey,
                    });
                }
            } else {
                console.error("❌ OTP verification failed!");
                return reply.status(400).send({ error: "Invalid OTP" });
            }
        } catch (error: any) {
            console.error("❌ Error verifying OTP:", error);
            return reply.status(500).send({ error: error.message || "Unknown error" });
        }
    });
  }