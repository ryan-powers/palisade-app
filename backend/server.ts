import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Enable CORS for frontend
fastify.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
});

// ✅ Add this users route
fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    return users;
});

fastify.get('/', async (request, reply) => {
    return { message: 'Hello from Fastify with TypeScript!' };
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


