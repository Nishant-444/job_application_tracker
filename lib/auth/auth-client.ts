import { createAuthClient } from 'better-auth/client';

export const authCLient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authCLient;
