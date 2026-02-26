'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { createColumn } from '@/lib/actions/columns';

export default function CreateColumn({ boardId }: { boardId: string }) {
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState('');
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus the input when the user clicks "Add Column"
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		startTransition(async () => {
			try {
				const result = await createColumn(boardId, name);
				if (result?.error) {
					toast.error(result.error);
					return;
				}

				toast.success('Column created');
				setName('');
				setIsEditing(false); // Close the input and go back to the button
			} catch (err) {
				toast.error('Failed to create column');
			}
		});
	}

	if (isEditing) {
		return (
			<Card className='min-w-[300px] flex-shrink-0 bg-gray-50 p-3 shadow-sm'>
				<form onSubmit={handleSubmit} className='space-y-3'>
					<Input
						ref={inputRef}
						placeholder='Column title...'
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={isPending}
						className='bg-white'
					/>
					<div className='flex items-center gap-2'>
						<Button
							type='submit'
							size='sm'
							disabled={isPending || !name.trim()}
						>
							{isPending ? 'Adding...' : 'Add Column'}
						</Button>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							onClick={() => {
								setIsEditing(false);
								setName('');
							}}
							disabled={isPending}
						>
							<X className='h-4 w-4' />
						</Button>
					</div>
				</form>
			</Card>
		);
	}

	return (
		<button
			onClick={() => setIsEditing(true)}
			className='min-w-75 shrink-0 flex justify-center items-start gap-2 rounded-lg bg-gray-100/50 hover:bg-gray-100 p-4 text-sm font-medium text-gray-600 transition-colors border border-dashed border-gray-300'
		>
			<Plus className='h-4 w-4 mt-0.5' />
			Add Column
		</button>
	);
}
