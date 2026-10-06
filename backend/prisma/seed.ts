import { PrismaClient, ProjectStatus, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding test users...');
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      fullName: 'Alice Smith',
      passwordHash: hashedPassword,
      tokenVersion: 0,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      passwordHash: hashedPassword,
      tokenVersion: 0,
    },
  });

  console.log(`Created users: ${alice.email}, ${bob.email}`);

  // Seed projects for Alice
  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Revamp the customer mobile experience using React Native and modern UI patterns.',
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date('2026-10-01T00:00:00Z'),
      endDate: new Date('2026-11-30T00:00:00Z'),
      ownerId: alice.id,
      tasks: {
        create: [
          {
            name: 'Design wireframes & user flow',
            description: 'Create high-fidelity mockups in Figma for authentication and project dashboard.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-10-10T00:00:00Z'),
          },
          {
            name: 'Implement authentication & secure storage',
            description: 'Connect JWT login, register, and expo-secure-store token persistence.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date('2026-10-20T00:00:00Z'),
          },
          {
            name: 'Push notification & offline banner setup',
            description: 'Implement NetInfo network detection and offline sync banners.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-11-05T00:00:00Z'),
          },
        ],
      },
    },
  });

  const webProject = await prisma.project.create({
    data: {
      name: 'Cloud Infrastructure Migration',
      description: 'Migrate legacy microservices to containerized cloud platform with automated CI/CD.',
      status: ProjectStatus.NOT_STARTED,
      startDate: new Date('2026-11-01T00:00:00Z'),
      endDate: new Date('2026-12-15T00:00:00Z'),
      ownerId: alice.id,
      tasks: {
        create: [
          {
            name: 'Audit environment configurations',
            description: 'Document all environment variables, secrets, and connection strings.',
            priority: TaskPriority.LOW,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-11-10T00:00:00Z'),
          },
          {
            name: 'Dockerize services & write compose manifests',
            description: 'Build multi-stage Dockerfiles and health check recipes.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.PENDING,
            dueDate: new Date('2026-11-25T00:00:00Z'),
          },
        ],
      },
    },
  });

  // Seed projects for Bob
  const bobProject = await prisma.project.create({
    data: {
      name: 'Q4 Product Marketing Campaign',
      description: 'End-of-year enterprise awareness campaign and customer outreach.',
      status: ProjectStatus.COMPLETED,
      startDate: new Date('2026-09-01T00:00:00Z'),
      endDate: new Date('2026-10-01T00:00:00Z'),
      ownerId: bob.id,
      tasks: {
        create: [
          {
            name: 'Draft press release & media outreach',
            description: 'Finalize copy and pitch to major tech media outlets.',
            priority: TaskPriority.HIGH,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-15T00:00:00Z'),
          },
          {
            name: 'Social media collateral & launch webinars',
            description: 'Conduct launch webinars and publish video snippets.',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.COMPLETED,
            dueDate: new Date('2026-09-30T00:00:00Z'),
          },
        ],
      },
    },
  });

  console.log(`Seeded projects: ${mobileProject.name}, ${webProject.name}, ${bobProject.name}`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
