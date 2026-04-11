import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, Status } from 'generated/prisma/client';
import { Pool } from 'pg';

class PrismaService extends PrismaClient {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}

console.log('Starting seed script...');

const prisma = new PrismaService();

async function main() {
  const categories = await prisma.$transaction(
    [
      {
        name: 'Tech',
        description: 'Technology articles',
      },
      {
        name: 'Home',
        description: 'Home articles',
      },
      {
        name: 'Geek',
        description: 'Geek articles',
      },
    ].map((category) =>
      prisma.category.create({
        data: category,
      }),
    ),
  );

  const users = await prisma.$transaction(
    [
      {
        login: 'admin',
        password: 'hashed-password',
        role: 'ADMIN' as Role,
      },
      {
        login: 'editor',
        password: 'hashed-password123',
        role: 'EDITOR' as Role,
      },
    ].map((user) =>
      prisma.user.create({
        data: user,
      }),
    ),
  );

  const tags = await prisma.$transaction(
    [
      { name: 'nestjs' },
      { name: 'prisma' },
      { name: 'typescript' },
      { name: 'javascript' },
      { name: 'nodejs' },
    ].map((tag) =>
      prisma.tag.create({
        data: tag,
      }),
    ),
  );

  const articles = await prisma.$transaction(
    [
      {
        title: 'Getting Started with Prisma',
        content:
          'Prisma is a database toolkit that makes it easy to work with databases.',
        authorId: users[0].id,
        categoryId: categories[0].id,
        status: 'PUBLISHED' as Status,
        tags: {
          connectOrCreate: [tags[1].id, tags[2].id].map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      {
        title: 'Building a REST API with NestJS',
        content:
          'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
        authorId: users[1].id,
        categoryId: categories[0].id,
        status: 'DRAFT' as Status,
        tags: {
          connectOrCreate: [tags[0].id, tags[4].id].map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      {
        title: 'TypeScript Best Practices',
        content:
          'Learn the best practices for using TypeScript in your projects.',
        authorId: users[0].id,
        categoryId: categories[2].id,
        status: 'PUBLISHED' as Status,
      },
      {
        title: 'JavaScript Performance Tips',
        content:
          'Improve the performance of your JavaScript applications with these tips.',
        authorId: users[1].id,
        categoryId: categories[1].id,
        status: 'ARCHIVED' as Status,
      },
      {
        title: 'Node.js Best Practices',
        content: 'Learn the best practices for using Node.js in your projects.',
        authorId: users[0].id,
        categoryId: categories[0].id,
        status: 'PUBLISHED' as Status,
        tags: {
          connectOrCreate: [tags[2].id, tags[4].id].map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    ].map((article) =>
      prisma.article.create({
        data: article,
        include: {
          tags: true,
        },
      }),
    ),
  );

  prisma.comment.createMany({
    data: [
      {
        content: 'Great article!',
        authorId: users[0].id,
        articleId: articles[0].id,
      },
      {
        content: 'Thanks for sharing this information.',
        authorId: users[1].id,
        articleId: articles[1].id,
      },
      {
        content: 'Thanks for sharing this information. *)',
        authorId: users[1].id,
        articleId: articles[4].id,
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
