'use server';

import { getSession } from '../auth/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';

export async function deleteColumn(columnId: string) {
	const session = await getSession();
	if (!session?.user) return { error: 'Unauthorized' };

	try {
		const column = await prisma.column.findUnique({
			where: { id: columnId },
			include: { board: true },
		});

		if (!column) return { error: 'Column not found' };

		if (column.board.userId !== session.user.id) {
			return { error: 'Unauthorized' };
		}

		await prisma.column.delete({
			where: { id: columnId },
		});

		revalidatePath('/dashboard');
		return { success: true };
	} catch (error) {
		console.error('Failed to delete column:', error);
		return { error: 'Database error' };
	}
}

export async function createColumn(boardId: string, name: string) {
	const session = await getSession();
	if (!session?.user) return { error: 'Unauthorized' };

	if (!name || name.trim() === '') {
		return { error: 'Column name cannot be empty' };
	}

	try {
		const board = await prisma.board.findUnique({
			where: { id: boardId },
		});

		if (!board || board.userId !== session.user.id) {
			return { error: 'Unauthorized' };
		}

		const lastColumn = await prisma.column.findFirst({
			where: { boardId },
			orderBy: { order: 'desc' },
			select: { order: true },
		});

		const newOrder = lastColumn ? lastColumn.order + 1 : 0;

		const newColumn = await prisma.column.create({
			data: {
				name: name.trim(),
				order: newOrder,
				boardId,
			},
		});

		revalidatePath('/dashboard');
		return { success: true, data: newColumn };
	} catch (error) {
		console.error('Failed to create column:', error);
		return { error: 'Database error' };
	}
}
