import { FastifyInstance } from 'fastify';
import prisma from '../prisma/client';

export async function userRoutes(fastify: FastifyInstance) {
    // ✅ Get User Public Key
    fastify.get("/get-user-public-key", async (request, reply) => {
      const { userId } = request.query as { userId: string };
  
      if (!userId) return reply.status(400).send({ error: "User ID is required" });
  
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { publicKey: true } });
  
      if (!user?.publicKey) return reply.status(404).send({ error: "Public key not found" });
  
      return reply.send({ receiverPublicKey: user.publicKey });
    });
  
    // ✅ Set Display Name
    fastify.post("/set-display-name", async (request, reply) => {
      const userId = request.headers["user-id"] as string;
      const { displayName } = request.body as { displayName: string };
  
      if (!userId || !displayName) {
        return reply.status(400).send({ error: "User ID and display name are required" });
      }
  
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { displayName },
        });
  
        return reply.send({ message: "Display name updated successfully", user: updatedUser });
      } catch (error) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    });
  
    // ✅ Get Display Name
    fastify.get("/get-display-name", async (request, reply) => {
      const userId = request.headers["user-id"] as string;
  
      if (!userId) return reply.status(401).send({ error: "User ID is required" });
  
      try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true } });
  
        return user ? reply.send({ displayName: user.displayName }) : reply.status(404).send({ error: "User not found" });
      } catch (error) {
        return reply.status(500).send({ error: "Internal server error" });
      }
    });
  }