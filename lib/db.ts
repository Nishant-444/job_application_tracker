import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// double assertion -- forget your standard type make it unknown then as prisma type
// by attaching prisma to globalThis, the instance survives the "hot reload" (because the global object isn't reset), allowing you to reuse the same connection pool across reloads.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error(
		'FATAL: DATABASE_URL is not set in the environment variables.',
	);
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
