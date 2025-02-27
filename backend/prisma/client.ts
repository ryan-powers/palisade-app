import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };  // ✅ Named export
export default prisma;  // ✅ Default export


