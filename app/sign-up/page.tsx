'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp } from '@/lib/auth/auth-client';
import { Chrome } from 'lucide-react'; // i know its deprecated but still...
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SignUp() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const router = useRouter();

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true);
		try {
			await signIn.social({
				provider: 'google',
				callbackURL: '/dashboard',
			});
		} catch (error) {
			toast.error('Failed to sign up with Google');
			setIsGoogleLoading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const result = await signUp.email({
				name,
				email,
				password,
			});

			if (result.error) {
				setError(result.error.message ?? 'Failed to sign up');
			} else {
				router.push('/dashboard');
				router.refresh();
			}
		} catch (error) {
			setError('An unexpected error occurred');
			console.error('Error', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4'>
			<Card className='w-full max-w-md border-gray-200 shadow-lg'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-black'>
						Sign Up
					</CardTitle>
					<CardDescription className='text-gray-600'>
						Create an account to start tracking your job applications
					</CardDescription>
				</CardHeader>

				<CardContent className='space-y-4'>
					<Button
						type='button'
						variant='outline'
						className='w-full border-gray-300 text-gray-700 hover:bg-gray-50'
						onClick={handleGoogleSignIn}
						disabled={isGoogleLoading || loading}
					>
						{isGoogleLoading ?
							'Redirecting...'
						:	<>
								<Chrome className='mr-2 h-4 w-4' />
								Continue with Google
							</>
						}
					</Button>{' '}
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t border-gray-200' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-white px-2 text-muted-foreground'>
								Or continue with email
							</span>
						</div>
					</div>
					<form onSubmit={handleSubmit} className='space-y-4'>
						{error && (
							<div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
								{error}
							</div>
						)}
						<div className='space-y-2'>
							<Label htmlFor='name' className='text-gray-700'>
								Name
							</Label>
							<Input
								id='name'
								type='text'
								placeholder='Your Name'
								minLength={3}
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								disabled={loading || isGoogleLoading}
								className='border-gray-300 focus:border-primary focus:ring-primary'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='email' className='text-gray-700'>
								Email
							</Label>
							<Input
								id='email'
								type='email'
								placeholder='Your Email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loading || isGoogleLoading}
								className='border-gray-300 focus:border-primary focus:ring-primary'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password' className='text-gray-700'>
								Password
							</Label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
								placeholder='Your Password'
								disabled={loading || isGoogleLoading}
								className='border-gray-300 focus:border-primary focus:ring-primary'
							/>
						</div>

						<Button
							type='submit'
							className='w-full bg-primary hover:bg-primary/90'
							disabled={loading || isGoogleLoading}
						>
							{loading ? 'Creating account...' : 'Sign Up'}
						</Button>
					</form>
				</CardContent>

				<CardFooter>
					<p className='w-full text-center text-sm text-gray-600'>
						Already have an account?{' '}
						<Link
							href='/sign-in'
							className='font-medium text-primary hover:underline'
						>
							Sign in
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
