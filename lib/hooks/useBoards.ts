'use client';

import { useState } from 'react';
import { CompleteBoard, CompleteColumn } from '@/types';
import { JobApplication } from '@prisma/client';
import { updateJobApplication } from '../actions/job-applications';

export default function useBoard(initialBoard?: CompleteBoard | null) {
	const board = initialBoard || null;

	const [columns, setColumns] = useState<CompleteColumn[]>(
		initialBoard?.columns || [],
	);

	const [prevBoard, setPrevBoard] = useState(initialBoard);

	if (initialBoard !== prevBoard) {
		setPrevBoard(initialBoard);
		setColumns(initialBoard?.columns || []);
	}

	const [error, setError] = useState<string | null>(null);

	async function moveJob(
		jobApplicationId: string,
		newColumnId: string,
		newOrder: number,
	) {
		setColumns((prev) => {
			const newColumn = prev.map((col) => ({
				...col,
				jobs: [...col.jobs],
			}));
			let jobToMove: JobApplication | null = null;
			let oldColumnId: string | null = null;
			for (const col of newColumn) {
				const jobIndex = col.jobs.findIndex((j) => j.id === jobApplicationId);
				if (jobIndex !== -1 && jobIndex !== undefined) {
					jobToMove = col.jobs[jobIndex];
					oldColumnId = col.id;
					col.jobs = col.jobs.filter((job) => job.id !== jobApplicationId);
				}
				break;
			}

			if (jobToMove && oldColumnId) {
				const targetColumnIndex = newColumn.findIndex(
					(col) => col.id === newColumnId,
				);
				if (targetColumnIndex !== -1) {
					const targetColumn = newColumn[targetColumnIndex];
					const currentJobs = targetColumn.jobs || [];

					const updatedJobs = [...currentJobs];
					updatedJobs.splice(newOrder, 0, {
						...jobToMove,
						columnId: newColumnId,
						order: newOrder * 100,
					});

					const jobsWithUpdatedOrders = updatedJobs.map((job, idx) => ({
						...job,
						order: idx * 100,
					}));

					newColumn[targetColumnIndex] = {
						...targetColumn,
						jobs: jobsWithUpdatedOrders,
					};
				}
			}
			return newColumn;
		});
		try {
			const result = await updateJobApplication(jobApplicationId, {
				columnId: newColumnId,
				order: newOrder,
			});
		} catch (err) {
			console.error('Error', err);
		}
	}

	return { board, columns, error, moveJob };
}
