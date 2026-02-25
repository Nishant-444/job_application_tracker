import { prisma } from '@/lib/db';

const USER_ID = process.env.SEED_USER_ID;

const SAMPLE_JOBS = [
	// Wish List
	{
		company: 'MU Company',
		position: 'Software Developer',
		location: 'San Francisco, CA',
		tags: ['React', 'Tailwind', 'High Pay'],
		description: 'Build modern web applications using React and Tailwind CSS',
		jobUrl: 'https://example.com/jobs/1',
		salary: '$120k - $150k',
	},
	{
		company: 'Stripe',
		position: 'Front End Developer',
		location: 'Remote',
		tags: ['TypeScript', 'React', 'Next.js'],
		description: 'Work on payment infrastructure frontend',
		jobUrl: 'https://example.com/jobs/2',
		salary: '$130k - $160k',
	},
	{
		company: 'Nutrishe',
		position: 'QA Engineer',
		location: 'New York, NY',
		tags: ['CIT', 'Appium', 'CI/CD'],
		description: 'Ensure quality of mobile and web applications',
		jobUrl: 'https://example.com/jobs/3',
		salary: '$90k - $110k',
	},
	// Applied
	{
		company: 'LeaFood',
		position: 'DevOps Engineer',
		location: 'Austin, TX',
		tags: ['promQL', 'Full-stack', 'Docker'],
		description: 'Manage infrastructure and deployment pipelines',
		jobUrl: 'https://example.com/jobs/4',
		salary: '$110k - $140k',
	},
	{
		company: 'Nomura',
		position: 'Mobile Developer',
		location: 'Tokyo, Japan',
		tags: ['React Native', 'iOS', 'Android'],
		description: 'Develop mobile applications for financial services',
		jobUrl: 'https://example.com/jobs/5',
		salary: '$100k - $130k',
	},
	{
		company: 'Wise',
		position: 'UI/UX Designer',
		location: 'London, UK',
		tags: ['Figma', 'Design Systems', 'User Research'],
		description: 'Design beautiful and intuitive user experiences',
		jobUrl: 'https://example.com/jobs/6',
		salary: '$80k - $100k',
	},
	{
		company: 'Danone',
		position: 'DevOps Engineer',
		location: 'Paris, France',
		tags: ['promQL', 'Full-stack', 'Docker'],
		description: 'Support cloud infrastructure and CI/CD',
		jobUrl: 'https://example.com/jobs/7',
		salary: '$95k - $120k',
	},
	// Interviewing
	{
		company: 'Retomotion',
		position: 'Web Designer',
		location: 'Berlin, Germany',
		tags: ['Figma', 'React', 'Bootstrap'],
		description: 'Create responsive web designs and implement them',
		jobUrl: 'https://example.com/jobs/8',
		salary: '$85k - $105k',
	},
	{
		company: 'WorkLab',
		position: 'Product Manager',
		location: 'Seattle, WA',
		tags: ['Product Strategy', 'Agile', 'Analytics'],
		description:
			'Help drive the product and business planning for our platform',
		jobUrl: 'https://example.com/jobs/9',
		salary: '$140k - $170k',
	},
	{
		company: 'I Networks',
		position: 'Mobile Developer',
		location: 'Remote',
		tags: ['Flutter', 'Dart', 'Firebase'],
		description: 'Build cross-platform mobile applications',
		jobUrl: 'https://example.com/jobs/10',
		salary: '$115k - $145k',
	},
	// Offer
	{
		company: 'Profan',
		position: 'Software Developer',
		location: 'Stockholm, Sweden',
		tags: ['Node.js', 'PostgreSQL', 'AWS'],
		description: 'Develop backend services and APIs',
		jobUrl: 'https://example.com/jobs/11',
		salary: '$100k - $125k',
	},
	{
		company: 'MUS Logistics',
		position: 'UI Designer',
		location: 'Amsterdam, Netherlands',
		tags: ['Figma', 'Illustrator'],
		description:
			'Lead the UX process and workflow, and work closely with development team',
		jobUrl: 'https://example.com/jobs/12',
		salary: '$90k - $110k',
	},
	// Rejected
	{
		company: 'Ultra Vouche',
		position: 'Associate',
		location: 'Chicago, IL',
		tags: ['Scrum', 'Agile'],
		description: 'Support product development and project management',
		jobUrl: 'https://example.com/jobs/13',
		salary: '$70k - $85k',
	},
	{
		company: 'NRI',
		position: 'Web Test',
		location: 'Boston, MA',
		tags: ['Testing', 'Automation'],
		description: 'Manage product testing and quality assurance',
		jobUrl: 'https://example.com/jobs/14',
		salary: '$75k - $90k',
	},
	{
		company: 'TOG London',
		position: 'Data Ana',
		location: 'London, UK',
		tags: ['JavaScript', 'Python', 'SQL'],
		description: 'Analyze user data and provide insights for product decisions',
		jobUrl: 'https://example.com/jobs/15',
		salary: '$85k - $100k',
	},
];

async function seed() {
	if (!USER_ID) {
		console.error('Error: SEED_USER_ID environment variable is required');
		console.log(
			'Usage: SEED_USER_ID=LJB1ZIDAfqdrasQFPJ8B4nXdZMou9QVZ npm run seed',
		);
		process.exit(1);
	}

	try {
		console.log('Starting seed process...');
		console.log(`Seeding data for user ID: ${USER_ID}`);

		let board = await prisma.board.findFirst({
			where: {
				userId: USER_ID,
				name: 'Job Hunt',
			},
		});

		if (!board) {
			console.log('Board not found. Creating board...');
			const { initializeUserBoard } = await import('../lib/init-user-board');
			board = await initializeUserBoard(USER_ID);
			console.log('Board created');
		} else {
			console.log('Board found');
		}

		const columns = await prisma.column.findMany({
			where: {
				boardId: board.id,
			},
			orderBy: {
				order: 'asc',
			},
		});

		if (columns.length === 0) {
			console.error(
				'No columns found. Please ensure the board has default columns.',
			);
			process.exit(1);
		}

		console.log(`Found ${columns.length} columns`);

		const columnMap: Record<string, string> = {};
		columns.forEach((col) => {
			columnMap[col.name] = col.id.toString();
		});

		const existingJobs = await prisma.jobApplication.findMany({
			where: { userId: USER_ID },
		});

		if (existingJobs.length > 0) {
			console.log(
				`🗑️  Deleting ${existingJobs.length} existing job applications...`,
			);
			await prisma.jobApplication.deleteMany({ where: { userId: USER_ID } });
		}

		const jobsByColumn: Record<string, typeof SAMPLE_JOBS> = {
			'Wish List': SAMPLE_JOBS.slice(0, 3),
			Applied: SAMPLE_JOBS.slice(3, 7),
			Interviewing: SAMPLE_JOBS.slice(7, 10),
			Offer: SAMPLE_JOBS.slice(10, 12),
			Rejected: SAMPLE_JOBS.slice(12, 15),
		};

		let totalCreated = 0;

		for (const [columnName, jobs] of Object.entries(jobsByColumn)) {
			const columnId = columnMap[columnName];
			if (!columnId) {
				console.warn(`⚠️ Column "${columnName}" not found, skipping...`);
				continue;
			}

			const jobsToInsert = jobs.map((jobData, index) => ({
				company: jobData.company,
				position: jobData.position,
				location: jobData.location,
				tags: jobData.tags,
				description: jobData.description,
				jobUrl: jobData.jobUrl,
				salary: jobData.salary,
				status: columnName.toLowerCase().replace(' ', '-'),
				order: index,
				columnId: columnId,
				boardId: board.id,
				userId: USER_ID,
			}));

			const result = await prisma.jobApplication.createMany({
				data: jobsToInsert,
			});

			totalCreated += result.count;
			console.log(`Added ${result.count} jobs to "${columnName}" column`);
		}

		console.log(`\n Seed completed successfully!`);
		console.log(`Created ${totalCreated} job applications`);
		console.log(`Board: ${board.name}`);
		console.log(`User ID: ${USER_ID}`);

		process.exit(0);
	} catch (error) {
		console.error('Error seeding database:', error);
		process.exit(1);
	}
}

seed();
