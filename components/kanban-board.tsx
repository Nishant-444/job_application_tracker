import type { Column, JobApplication, Prisma } from '@prisma/client';
import {
	Award,
	Calendar,
	CheckCircle2,
	Mic,
	MoreVertical,
	Trash2,
	XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import CreateJobApplication from './create-job';
import JobApplicationCard from './job-application-card';

export type BoardWithData = Prisma.BoardGetPayload<{
	include: {
		columns: {
			include: { jobs: true };
		};
	};
}>;

type ColumnWithJobs = Prisma.ColumnGetPayload<{
	include: { jobs: true };
}>;

interface KanbanBoardProps {
	board: BoardWithData;
	userId: string;
}

interface ColConfig {
	color: string;
	icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
	{ color: 'bg-cyan-500', icon: <Calendar className='h-4 w-4' /> },
	{ color: 'bg-purple-500', icon: <CheckCircle2 className='h-4 w-4' /> },
	{ color: 'bg-green-500', icon: <Mic className='h-4 w-4' /> },
	{ color: 'bg-yellow-500', icon: <Award className='h-4 w-4' /> },
	{ color: 'bg-red-500', icon: <XCircle className='h-4 w-4' /> },
];

function DroppableColumn({
	column,
	config,
	boardId,
	sortedColumns,
}: {
	column: ColumnWithJobs;
	config: ColConfig;
	boardId: string;
	sortedColumns: Column[];
}) {
	const sortedJobs = column.jobs || [];

	return (
		<Card className='w-full shadow-md p-0'>
			{' '}
			<CardHeader
				className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}
			>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						{config.icon}
						<CardTitle className='text-white text-base font-semibold'>
							{column.name}
						</CardTitle>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='h-6 w-6 text-white hover:bg-white/20'
							>
								<MoreVertical className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem className='text-destructive'>
								<Trash2 className='mr-2 h-4 w-4' />
								Delete Column
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className='space-y-2 pt-4 bg-gray-50/50 min-h-100 rounded-b-lg'>
				{sortedJobs.map((job) => (
					<JobApplicationCard
						key={job.id}
						job={{ ...job, columnId: job.columnId || column.id }}
						columns={sortedColumns}
					/>
				))}
				<CreateJobApplication columnId={column.id} boardId={boardId} />
			</CardContent>
		</Card>
	);
}

function SortableJobCard({
	job,
	columns,
}: {
	job: JobApplication;
	columns: Column[];
}) {
	return (
		<div>
			<JobApplicationCard job={job} columns={columns} />
		</div>
	);
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
	const sortedColumns = [...(board.columns || [])].sort(
		(a, b) => a.order - b.order,
	);
	// console.log(board.columns[0]?.jobs);

	return (
		<div className='flex flex-col gap-4 p-4'>
			{sortedColumns.map((col, key) => {
				const config = COLUMN_CONFIG[key] || {
					color: 'bg-gray-500',
					icon: <Calendar className='h-4 w-4' />,
				};
				return (
					<DroppableColumn
						key={col.id}
						column={col}
						config={config}
						boardId={board.id}
						sortedColumns={sortedColumns}
					/>
				);
			})}
		</div>
	);
}
