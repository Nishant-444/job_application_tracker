import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

export default async function proxy(request: NextRequest) {
	// `next/headers` breaks in proxy/middleware, so the standard getSession will not work we have to get headers directly from the request object instead
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	const isSignUpPage = request.nextUrl.pathname.startsWith('/sign-up');
	const isSignInPage = request.nextUrl.pathname.startsWith('/sign-in');

	if ((isSignInPage || isSignUpPage) && session?.user) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}
	return NextResponse.next();
}
