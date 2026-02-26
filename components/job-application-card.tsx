'use client';

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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
	deleteJobApplication,
	updateJobApplication,
} from '@/lib/actions/job-applications';

interface JobApplicationCardProps {
	job: JobApplication;
	columns: Column[];
	dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

export default function JobApplicationCard({
	job,
	columns,
	dragHandleProps,
}: JobApplicationCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [formData, setFormData] = useState({
		company: job.company,
		position: job.position,
		location: job.location || '',
		notes: job.notes || '',
		salary: job.salary || '',
		jobUrl: job.jobUrl || '',
		columnId: job.columnId || '',
		tags: job.tags?.join(', ') || '',
		description: job.description || '',
	});

	function handleUpdate(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		startTransition(async () => {
			try {
				const result = await updateJobApplication(job.id, {
					...formData,
					tags: formData.tags
						.split(',')
						.map((tag) => tag.trim())
						.filter((tag) => tag.length > 0),
				});

				if (result?.error) {
					toast.error(result.error);
					return;
				}

				toast.success('Job application updated');
				setIsEditing(false);
			} catch (err) {
				toast.error('Failed to update job application. Please try again.');
				console.error(err);
			}
		});
	}

	function handleDelete() {
		startTransition(async () => {
			try {
				const result = await deleteJobApplication(job.id);

				if (result?.error) {
					toast.error(result.error);
					return;
				}

				toast.success('Job application deleted');
			} catch (err) {
				toast.error('Failed to delete job application');
				console.error(err);
			}
		});
	}

	function handleMove(newColumnId: string) {
		startTransition(async () => {
			try {
				const result = await updateJobApplication(job.id, {
					columnId: newColumnId,
				});

				if (result?.error) {
					toast.error(result.error);
					return;
				}

				toast.success('Job moved successfully');
			} catch (err) {
				toast.error('Failed to move job application');
				console.error(err);
			}
		});
	}

	return (
		<>
			<Card
				className={`cursor-pointer transition-all bg-white group shadow-sm hover:shadow-lg ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
				{...dragHandleProps}
			>
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
									rel='noopener noreferrer'
									className='inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1'
								>
									<ExternalLink className='h-3 w-3' />
								</a>
							)}
						</div>

						<div className='flex items-start gap-1'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										size='icon'
										className='h-6 w-6'
										disabled={isPending}
									>
										<MoreVertical className='h-4 w-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuItem onClick={() => setIsEditing(true)}>
										<Edit2 className='mr-2 h-4 w-4' />
										Edit
									</DropdownMenuItem>
									{columns.length > 1 && (
										<>
											{columns
												.filter((c) => c.id !== job.columnId)
												.map((column) => (
													<DropdownMenuItem
														key={column.id}
														onClick={() => handleMove(column.id)}
													>
														Move to {column.name}
													</DropdownMenuItem>
												))}
										</>
									)}
									<DropdownMenuItem
										className='text-destructive focus:text-destructive'
										onClick={handleDelete}
									>
										<Trash2 className='mr-2 h-4 w-4' />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog open={isEditing} onOpenChange={setIsEditing}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Edit Job Application</DialogTitle>
						<DialogDescription>
							Update details for {job.company}
						</DialogDescription>
					</DialogHeader>
					<form className='space-y-4' onSubmit={handleUpdate}>
						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='company'>Company *</Label>
									<Input
										id='company'
										required
										value={formData.company}
										onChange={(e) =>
											setFormData({ ...formData, company: e.target.value })
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='position'>Position *</Label>
									<Input
										id='position'
										required
										value={formData.position}
										onChange={(e) =>
											setFormData({ ...formData, position: e.target.value })
										}
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='location'>Location</Label>
									<Input
										id='location'
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='salary'>Salary</Label>
									<Input
										id='salary'
										placeholder='e.g., $100k - $150k'
										value={formData.salary}
										onChange={(e) =>
											setFormData({ ...formData, salary: e.target.value })
										}
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='jobUrl'>Job URL</Label>
								<Input
									id='jobUrl'
									type='url'
									placeholder='https://...'
									value={formData.jobUrl}
									onChange={(e) =>
										setFormData({ ...formData, jobUrl: e.target.value })
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='tags'>Tags (comma-separated)</Label>
								<Input
									id='tags'
									placeholder='React, Tailwind, High Pay'
									value={formData.tags}
									onChange={(e) =>
										setFormData({ ...formData, tags: e.target.value })
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									rows={3}
									placeholder='Brief description of the role...'
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='notes'>Notes</Label>
								<Textarea
									id='notes'
									rows={4}
									value={formData.notes}
									onChange={(e) =>
										setFormData({ ...formData, notes: e.target.value })
									}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsEditing(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending}>
								{isPending ? 'Saving...' : 'Save Changes'}{' '}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
