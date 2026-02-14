import { prisma } from './db';

const DEFAULT_COLUMNS = [
	{ name: 'Wish List', order: 0 },
	{ name: 'Applied', order: 1 },
	{ name: 'Interviewing', order: 2 },
	{ name: 'Offer', order: 3 },
	{ name: 'Rejected', order: 4 },
];

export async function initializeUserBoard(userId: string) {
	const existingBoard = await prisma.board.findFirst({
		where: {
			userId: userId,
			name: 'Job Hunt',
		},
		include: { columns: true },
	});

	if (existingBoard) {
		return existingBoard;
	}

	const board = await prisma.board.create({
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
			columns: true,
		},
	});

	return board;
}
