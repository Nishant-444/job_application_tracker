import { Prisma } from '@prisma/client';

export type CompleteBoard = Prisma.BoardGetPayload<{
	include: {
		columns: {
			include: {
				jobs: true;
			};
		};
	};
}>;

export type CompleteColumn = CompleteBoard['columns'][0];
export type CompleteJob = CompleteColumn['jobs'][0];
