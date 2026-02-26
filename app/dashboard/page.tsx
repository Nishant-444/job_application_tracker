import KanbanBoard from '@/components/kanban-board';
import { getSession } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

const DEFAULT_COLUMNS = [
	{ name: 'Wish List', order: 0 },
	{ name: 'Applied', order: 1 },
	{ name: 'Interviewing', order: 2 },
	{ name: 'Offer', order: 3 },
	{ name: 'Rejected', order: 4 },
];

// helper function
async function getOrCreateBoard(userId: string) {
	'use cache';
	const existingBoard = await prisma.board.findFirst({
		where: {
			userId: userId,
			name: 'Job Hunt',
		},
		include: {
			columns: {
				include: {
					jobs: true,
				},
			},
		},
	});

	if (existingBoard) {
		return existingBoard;
	}

	const newBoard = await prisma.board.create({
		data: {
			name: 'Job Hunt',
			userId: userId,
			columns: {
				create: DEFAULT_COLUMNS.map((col) => ({
					name: col.name,
					order: col.order,
				})),
			},
		},
		include: {
			columns: {
				include: {
					jobs: true,
				},
			},
		},
	});

	return newBoard;
}

async function DashboardPage() {
	const session = await getSession();

	if (!session) {
		redirect('/sign-in');
	}

	const board = await getOrCreateBoard(session.user.id);

	return (
		<div className='min-h-screen bg-white'>
			<div className='container mx-auto p-6'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-black'>Job Hunt</h1>
					<p className='text-gray-600'>Track your job applications</p>
				</div>

				<KanbanBoard board={board} userId={session.user.id} />
			</div>
		</div>
	);
}

// exported function
export default async function Dashboard() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<DashboardPage />
		</Suspense>
	);
}
