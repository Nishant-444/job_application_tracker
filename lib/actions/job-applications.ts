'use server';

import { getSession } from '../auth/auth';
import { prisma } from '../db';
import { revalidatePath } from 'next/cache';

interface CreateJobData {
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

interface UpdateJobData {
	company?: string;
	position?: string;
	location?: string;
	notes?: string;
	salary?: string;
	jobUrl?: string;
	columnId?: string;
	order?: number;
	tags?: string[];
	description?: string;
}

export async function createJobApplication(data: CreateJobData) {
	const session = await getSession();
	if (!session?.user) return { error: 'Unauthorized' };

	try {
		const board = await prisma.board.findFirst({
			where: { id: data.boardId, userId: session.user.id },
		});
		if (!board) return { error: 'Board not found' };

		const column = await prisma.column.findFirst({
			where: { id: data.columnId, boardId: data.boardId },
		});
		if (!column) return { error: 'Column not found' };

		const lastJob = await prisma.jobApplication.findFirst({
			where: { columnId: data.columnId },
			orderBy: { order: 'desc' },
			select: { order: true },
		});

		const jobApplication = await prisma.jobApplication.create({
			data: {
				company: data.company,
				position: data.position,
				location: data.location,
				notes: data.notes,
				salary: data.salary,
				jobUrl: data.jobUrl,
				description: data.description,
				tags: data.tags || [],
				status: 'applied',
				order: lastJob ? lastJob.order + 1 : 0,
				columnId: data.columnId,
				boardId: data.boardId,
				userId: session.user.id,
			},
		});

		revalidatePath('/dashboard');
		return { data: jobApplication };
	} catch (error) {
		console.error('Failed to create job:', error);
		return { error: 'Database error' };
	}
}

export async function updateJobApplication(id: string, updates: UpdateJobData) {
	const session = await getSession();
	if (!session?.user) return { error: 'Unauthorized' };

	try {
		const currentJob = await prisma.jobApplication.findUnique({
			where: { id },
		});

		if (!currentJob) return { error: 'Job not found' };
		if (currentJob.userId !== session.user.id) return { error: 'Unauthorized' };

		const { columnId: newColumnId, order: newOrder, ...textUpdates } = updates;

		// for only text field changes
		if (newColumnId === undefined && newOrder === undefined) {
			const updatedJob = await prisma.jobApplication.update({
				where: { id },
				data: textUpdates,
			});
			revalidatePath('/dashboard');
			return { data: updatedJob };
		}

		// any movement
		const oldColumnId = currentJob.columnId;
		const oldOrder = currentJob.order;

		const targetColumnId =
			newColumnId !== undefined ? newColumnId : oldColumnId;
		let targetOrder = newOrder;

		if (
			newColumnId !== undefined &&
			newOrder === undefined &&
			newColumnId !== oldColumnId
		) {
			const lastJob = await prisma.jobApplication.findFirst({
				where: { columnId: newColumnId },
				orderBy: { order: 'desc' },
				select: { order: true },
			});
			targetOrder = lastJob ? lastJob.order + 1 : 0;
		}

		if (targetOrder === undefined) targetOrder = oldOrder;

		const isMovingToDifferentColumn = targetColumnId !== oldColumnId;

		// execute within a transaction to prevent data corruption
		await prisma.$transaction(async (tx) => {
			if (Object.keys(textUpdates).length > 0) {
				await tx.jobApplication.update({
					where: { id },
					data: textUpdates,
				});
			}

			if (isMovingToDifferentColumn) {
				await tx.jobApplication.updateMany({
					where: { columnId: oldColumnId, order: { gt: oldOrder } },
					data: { order: { decrement: 1 } },
				});

				await tx.jobApplication.updateMany({
					where: { columnId: targetColumnId, order: { gte: targetOrder } },
					data: { order: { increment: 1 } },
				});
			} else {
				if (oldOrder === targetOrder) return;

				if (oldOrder < targetOrder) {
					await tx.jobApplication.updateMany({
						where: {
							columnId: oldColumnId,
							order: { gt: oldOrder, lte: targetOrder },
						},
						data: { order: { decrement: 1 } },
					});
				} else {
					await tx.jobApplication.updateMany({
						where: {
							columnId: oldColumnId,
							order: { gte: targetOrder, lt: oldOrder },
						},
						data: { order: { increment: 1 } },
					});
				}
			}

			await tx.jobApplication.update({
				where: { id },
				data: { columnId: targetColumnId, order: targetOrder },
			});
		});

		revalidatePath('/dashboard');
		return { success: true };
	} catch (error) {
		console.error('Failed to update job:', error);
		return { error: 'Database transaction failed' };
	}
}

export async function deleteJobApplication(id: string) {
	const session = await getSession();
	if (!session?.user) return { error: 'Unauthorized' };

	try {
		const jobApplication = await prisma.jobApplication.findUnique({
			where: { id },
			select: { userId: true, columnId: true, order: true },
		});

		if (!jobApplication) return { error: 'Job not found' };
		if (jobApplication.userId !== session.user.id)
			return { error: 'Unauthorized' };

		await prisma.$transaction([
			prisma.jobApplication.delete({ where: { id } }),
			prisma.jobApplication.updateMany({
				where: {
					columnId: jobApplication.columnId,
					order: { gt: jobApplication.order },
				},
				data: { order: { decrement: 1 } },
			}),
		]);

		revalidatePath('/dashboard');
		return { success: true };
	} catch (error) {
		console.error('Failed to delete job:', error);
		return { error: 'Database error' };
	}
}
