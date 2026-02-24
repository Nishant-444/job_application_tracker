'use server';

import { getSession } from '../auth/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';

interface JobApplicationData {
	company: string;
	position: string;
	location?: string;
	notes?: string;
	salary?: string;
	jobUrl?: string;
	columnId: string;
	boardId: string;
	tags?: string[];
	description?: string;
}

export async function createJobApplication(data: JobApplicationData) {
	const session = await getSession();

	if (!session?.user) {
		return { error: 'Unauthorized: Please log in again.' };
	}

	const {
		company,
		position,
		location,
		notes,
		salary,
		jobUrl,
		columnId,
		boardId,
		tags,
		description,
	} = data;

	if (!company || !position || !columnId || !boardId) {
		return { error: 'Missing required fields' };
	}

	try {
		const board = await prisma.board.findFirst({
			where: { id: boardId, userId: session.user.id },
		});

		if (!board) {
			return { error: 'Board not found or unauthorized.' };
		}

		const column = await prisma.column.findFirst({
			where: { id: columnId, boardId: boardId },
		});

		if (!column) {
			return { error: 'Column not found!' };
		}

		const lastJob = await prisma.jobApplication.findFirst({
			where: { columnId: columnId },
			orderBy: { order: 'desc' },
			select: { order: true },
		});

		const jobApplication = await prisma.jobApplication.create({
			data: {
				company,
				position,
				location,
				notes,
				salary,
				jobUrl,
				description,
				tags: tags || [],
				status: 'applied',
				order: lastJob ? lastJob.order + 1 : 0,
				columnId: columnId,
				boardId: boardId,
				userId: session.user.id,
			},
		});

		revalidatePath('/dashboard');

		return { data: jobApplication };
	} catch (error) {
		console.error('Failed to create job application:', error);
		return { error: 'An unexpected database error occurred.' };
	}
}
