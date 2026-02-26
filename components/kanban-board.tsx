'use client';
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
import useBoard from '@/lib/hooks/useBoards';
import {
	closestCorners,
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { updateJobApplication } from '@/lib/actions/job-applications';
import { toast } from 'sonner';
import { useState } from 'react';
import { prisma } from '@/lib/db';

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
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
		data: {
			type: 'column',
			columnId: column.id,
		},
	});
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
								{/* Todo -- add the correct functionality  */}
								Delete Column
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent
				ref={setNodeRef}
				className={`space-y-2 pt-4 bg-gray-50/50 min-h-100 rounded-b-lg ${isOver ? 'ring-2 ring-blue-500' : ''}`}
			>
				<SortableContext
					items={sortedJobs.map((job) => job.id)}
					strategy={verticalListSortingStrategy}
				>
					{sortedJobs.map((job) => (
						<SortableJobCard
							key={job.id}
							job={{ ...job, columnId: job.columnId || column.id }}
							columns={sortedColumns}
						/>
					))}
				</SortableContext>
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
	const {
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
		setNodeRef,
	} = useSortable({
		id: job.id,
		data: {
			type: 'job',
			job,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<JobApplicationCard
				job={job}
				columns={columns}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	);
}

export default function KanbanBoard({ board }: KanbanBoardProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const { columns, moveJob } = useBoard(board);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const sortedColumns = [...(board.columns || [])].sort(
		(a, b) => a.order - b.order,
	);
	// console.log(board.columns[0]?.jobs);

	async function handleDragStart(event: DragStartEvent) {
		setActiveId(event.active.id as string);
	}

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		setActiveId(null);
		if (!over || !board.id) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		let draggedJob: JobApplication | null = null;
		let sourceColumn: Column | null = null;
		let sourceIndex = -1;

		for (const column of sortedColumns) {
			const jobs = [...(column.jobs || [])].sort((a, b) => a.order - b.order);
			const index = jobs.findIndex((j) => j.id === activeId);

			if (index !== -1) {
				draggedJob = jobs[index];
				sourceColumn = column;
				sourceIndex = index;
				break;
			}
		}

		if (!draggedJob || !sourceColumn) return;

		const targetColumn = sortedColumns.find((col) => col.id === overId);
		const targetJob = sortedColumns
			.flatMap((col) => col.jobs || [])
			.find((job) => job.id === overId);

		let targetColumnId: string;
		let newOrder: number;

		if (targetColumn) {
			targetColumnId = targetColumn.id;
			const jobsInTarget = targetColumn.jobs
				.filter((j) => j.id !== activeId)
				.sort((a, b) => a.order - b.order);

			newOrder = jobsInTarget.length;
		} else if (targetJob) {
			const targetJobColumn = sortedColumns.find((col) =>
				col.jobs.some((j) => j.id === targetJob.id),
			);
			targetColumnId = targetJob.columnId || targetJobColumn?.id || '';
			if (!targetColumnId) return;

			const targetColumnObj = sortedColumns.find(
				(col) => col.id === targetColumnId,
			);

			if (!targetColumnObj) return;

			const allJobsInTargetOriginal =
				targetColumnObj.jobs.sort((a, b) => a.order - b.order) || [];

			const allJobsInTargetFiltered =
				allJobsInTargetOriginal.filter((j) => j.id !== activeId) || [];

			const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(
				(j) => j.id === overId,
			);
			const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(
				(j) => j.id === overId,
			);

			if (targetIndexInFiltered !== -1) {
				if (sourceColumn.id === targetColumnId) {
					if (sourceIndex < targetIndexInOriginal) {
						newOrder = targetIndexInFiltered + 1;
					} else {
						newOrder = targetIndexInFiltered;
					}
				} else {
					newOrder = allJobsInTargetFiltered.length;
				}
			} else {
				newOrder = targetIndexInFiltered;
			}
		} else {
			return;
		}

		if (!targetColumnId) return;
		await moveJob(activeId, targetColumnId, newOrder);
	}
	const activeJob = sortedColumns
		.flatMap((col) => col.jobs || [])
		.find((job) => job.id === activeId);
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCorners}
			onDragEnd={handleDragEnd}
		>
			<div className='space-y-4'>
				<div className='flex gap-4 overflow-x-auto pb-4'>
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
			</div>
			<DragOverlay>
				{activeJob ?
					<div className='opacity-50'>
						<JobApplicationCard job={activeJob} columns={sortedColumns} />
					</div>
				:	null}
			</DragOverlay>
		</DndContext>
	);
}
