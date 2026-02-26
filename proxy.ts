import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export default async function proxy(request: NextRequest) {
	// `next/headers` breaks in edge/proxy runtimes, so we pass headers directly
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	const url = request.nextUrl.pathname;

	const isAuthPage = url.startsWith('/sign-in') || url.startsWith('/sign-up');
	const isProtectedRoute = url.startsWith('/dashboard');

	if (isAuthPage && session?.user) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	if (isProtectedRoute && !session?.user) {
		return NextResponse.redirect(new URL('/sign-in', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/(api|trpc)(.*)',
	],
};
