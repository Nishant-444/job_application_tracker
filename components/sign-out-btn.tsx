'use client';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { signOut } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
	const router = useRouter();
	return (
		<DropdownMenuItem
			onClick={async () => {
				const result = await signOut();
				if (result.data) {
					router.push('/sign-in');
					router.refresh();
				} else {
					alert('Error signing out');
				}
			}}
		>
			Log Out
		</DropdownMenuItem>
	);
}
