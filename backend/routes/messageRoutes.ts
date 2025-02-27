import { FastifyInstance } from 'fastify';
import prisma from '../prisma/client';

export async function messageRoutes(fastify: FastifyInstance) {
    fastify.post("/send-message", async (request, reply) => {
      const { senderId, receiverId, content, nonce } = request.body;
      if (!senderId || !receiverId || !content || !nonce) {
        return reply.status(400).send({ error: "Missing required fields" });
      }
  
      try {
        const savedMessage = await prisma.message.create({ data: { senderId, receiverId, content, nonce } });
        return reply.send({ message: "Message sent", id: savedMessage.id });
      } catch (error) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    });
  
    fastify.get("/get-messages", async (request, reply) => {
      const messages = await prisma.message.findMany({
        select: { id: true, senderId: true, receiverId: true, content: true, nonce: true, sender: { select: { publicKey: true } } },
      });
  
      return reply.send(messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        senderPublicKey: msg.sender.publicKey,
        content: msg.content,
        nonce: msg.nonce,
      })));
    });
  }