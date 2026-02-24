import { Column, JobApplication } from '@prisma/client';
import { Card, CardContent } from './ui/card';
import { Edit2, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

interface JobApplicationCardProps {
	job: JobApplication;
	columns: Column[];
}

export default function JobApplicationCard({
	job,
	columns,
}: JobApplicationCardProps) {
	return (
		<>
			<Card className='cursor-pointer transition-shadow hover:shadow-lg bg-white group shadow-sm'>
				<CardContent className='p-4'>
					<div className='flex items-start justify-between gap-2'>
						<div className='flex-1 min-w-0'>
							<h3 className='font-semibold text-sm mb-1'>{job.position}</h3>
							<p className='text-xs text-muted-foreground mb-2'>
								{job.company}
							</p>
							{job.description && (
								<p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
									{job.description}
								</p>
							)}
							{job.tags && job.tags.length > 0 && (
								<div className='flex flex-wrap gap-1 mb-2'>
									{job.tags.map((tag, index) => (
										<span
											key={index}
											className='px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
										>
											{tag}
										</span>
									))}
								</div>
							)}
							{job.jobUrl && (
								<a
									href={job.jobUrl}
									target='_blank'
									className='inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1'
								>
									<ExternalLink className='h-3 w-3' />
								</a>
							)}
						</div>
						<div className='flex items-start gap-1'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant='ghost' size='icon' className='h-6 w-6'>
										<MoreVertical className='h-4 w-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuItem>
										<Edit2 className='mr-2 h-4 w-4' />
										Edit
									</DropdownMenuItem>
									{columns.length > 1 && (
										<>
											{columns
												.filter((c) => c.id !== job.columnId)
												.map((column, key) => (
													<DropdownMenuItem key={key}>
														Move to {column.name}
													</DropdownMenuItem>
												))}
										</>
									)}
									<DropdownMenuItem className='text-destructive'>
										<Trash2 className='mr-2 h-4 w-4' />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	);
}
