import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { prisma } from '../db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { initializeUserBoard } from '../init-user-board';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),

	emailAndPassword: {
		enabled: true,
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					if (user.id) {
						await initializeUserBoard(user.id);
					}
				},
			},
		},
	},
});

export async function signOut() {
	const result = await auth.api.signOut({
		headers: await headers(),
	});
	if (result.success) {
		redirect('/sign-in');
	}
}

export async function getSession() {
	const result = await auth.api.getSession({
		headers: await headers(),
	});
	return result;
}
