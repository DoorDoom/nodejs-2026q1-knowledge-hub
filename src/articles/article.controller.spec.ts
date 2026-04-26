import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { Role, Status } from 'generated/prisma/enums';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import exp from 'constants';
import { validate } from 'class-validator';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const mockArticles = [
  {
    id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3v',
    createdAt: new Date(1776762848975),
    updatedAt: new Date(1776762848975),
    title: 'Getting Started with Prisma',
    content:
      'Prisma is a database toolkit that makes it easy to work with databases.',
    status: Status.PUBLISHED,
    authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
    tags: [
      { name: '9c4c24fe-fbf5-4c3b-83b5-d521de708340' },
      { name: 'bc12d166-0a77-45aa-aae2-edee0f67cd6a' },
    ],
  },
  {
    id: '67b62108-769e-4097-8ac8-a2764566e1f7',
    createdAt: new Date(1776762848994),
    updatedAt: new Date(1776762848994),
    title: 'Building a REST API with NestJS',
    content:
      'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
    status: Status.DRAFT,
    authorId: 'c2a54daa-6bde-40f8-a05b-177846d25547',
    categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
    tags: [
      { name: 'a580a9fe-e03f-45b5-bf92-d57bedf4f9cf' },
      { name: '751244be-8f69-40a5-ac67-7e99e63293f4' },
    ],
  },
  {
    id: 'be51365e-f1a5-41a6-a13c-b9bc4f79483d',
    createdAt: new Date(1776762849006),
    updatedAt: new Date(1776762849006),
    title: 'TypeScript Best Practices',
    content: 'Learn the best practices for using TypeScript in your projects.',
    status: Status.PUBLISHED,
    authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    categoryId: '8e733809-991d-4ddd-9c3a-63035cb97530',
    tags: [],
  },
  {
    id: '4de100a0-f4ec-4a78-a07a-d500b84941d2',
    createdAt: new Date(1776762849011),
    updatedAt: new Date(1776762849011),
    title: 'JavaScript Performance Tips',
    content:
      'Improve the performance of your JavaScript applications with these tips.',
    status: Status.ARCHIVED,
    authorId: 'c2a54daa-6bde-40f8-a05b-177846d25547',
    categoryId: 'ac285a2c-20bc-4fd0-8a3f-367686693e74',
    tags: [],
  },
  {
    id: 'ddae7fb0-f93d-431d-9974-68bd8bd86b63',
    createdAt: new Date(1776762849015),
    updatedAt: new Date(1776762849015),
    title: 'Node.js Best Practices',
    content: 'Learn the best practices for using Node.js in your projects.',
    status: 'published',
    authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
    tags: [
      { name: 'bc12d166-0a77-45aa-aae2-edee0f67cd6a' },
      { name: '751244be-8f69-40a5-ac67-7e99e63293f4' },
    ],
  },
];

const resultArticles = [
  {
    id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3v',
    createdAt: 1776762848975,
    updatedAt: 1776762848975,
    title: 'Getting Started with Prisma',
    content:
      'Prisma is a database toolkit that makes it easy to work with databases.',
    status: 'published',
    authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
    tags: [
      '9c4c24fe-fbf5-4c3b-83b5-d521de708340',
      'bc12d166-0a77-45aa-aae2-edee0f67cd6a',
    ],
  },
  {
    id: '67b62108-769e-4097-8ac8-a2764566e1f7',
    createdAt: 1776762848994,
    updatedAt: 1776762848994,
    title: 'Building a REST API with NestJS',
    content:
      'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
    status: 'draft',
    authorId: 'c2a54daa-6bde-40f8-a05b-177846d25547',
    categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
    tags: [
      'a580a9fe-e03f-45b5-bf92-d57bedf4f9cf',
      '751244be-8f69-40a5-ac67-7e99e63293f4',
    ],
  },
  {
    id: 'be51365e-f1a5-41a6-a13c-b9bc4f79483d',
    createdAt: 1776762849006,
    updatedAt: 1776762849006,
    title: 'TypeScript Best Practices',
    content: 'Learn the best practices for using TypeScript in your projects.',
    status: 'published',
    authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    categoryId: '8e733809-991d-4ddd-9c3a-63035cb97530',
    tags: [],
  },
  {
    id: '4de100a0-f4ec-4a78-a07a-d500b84941d2',
    createdAt: 1776762849011,
    updatedAt: 1776762849011,
    title: 'JavaScript Performance Tips',
    content:
      'Improve the performance of your JavaScript applications with these tips.',
    status: 'archived',
    authorId: 'c2a54daa-6bde-40f8-a05b-177846d25547',
    categoryId: 'ac285a2c-20bc-4fd0-8a3f-367686693e74',
    tags: [],
  },
  {
    id: 'ddae7fb0-f93d-431d-9974-68bd8bd86b63',
    createdAt: 1776762849015,
    updatedAt: 1776762849015,
    title: 'Node.js Best Practices',
    content: 'Learn the best practices for using Node.js in your projects.',
    status: 'published',
    authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
    categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
    tags: [
      'bc12d166-0a77-45aa-aae2-edee0f67cd6a',
      '751244be-8f69-40a5-ac67-7e99e63293f4',
    ],
  },
];

describe('ArticlesService', () => {
  let articlesService: ArticlesService;
  let prisma;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = moduleRef.get(PrismaService);

    vi.spyOn(prisma.article, 'findMany').mockResolvedValue(mockArticles);
    vi.spyOn(prisma.article, 'findUnique').mockResolvedValue(mockArticles[0]);
    vi.spyOn(prisma.article, 'create').mockResolvedValue(mockArticles[0]);
    vi.spyOn(prisma.article, 'update').mockResolvedValue(mockArticles[0]);
    vi.spyOn(prisma.article, 'delete').mockResolvedValue(mockArticles[0]);

    articlesService = new ArticlesService(prisma);
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const result = await articlesService.findAll();

      expect(result).toEqual(resultArticles);
      expect(prisma.article.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      const result = await articlesService.findOne({
        id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
      });

      expect(result).toEqual(resultArticles[0]);
      expect(prisma.article.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      await expect(
        articlesService.findOne({ id: '9e152776-2e6d-4f43-8328-19f2ebd6fa35' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParam', () => {
    it('should return articles without filters', async () => {
      prisma.article.findMany.mockResolvedValue(mockArticles);

      const result = await articlesService.findbyParam({} as any);

      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: {},
        include: { tags: true },
      });

      expect(result[0].tags).toEqual([
        '9c4c24fe-fbf5-4c3b-83b5-d521de708340',
        'bc12d166-0a77-45aa-aae2-edee0f67cd6a',
      ]);
    });

    it('should filter by status', async () => {
      prisma.article.findMany.mockResolvedValue([]);

      await articlesService.findbyParam({ status: 'PUBLISHED' } as any);

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
        }),
      );
    });

    it('should filter by tag', async () => {
      prisma.article.findMany.mockResolvedValue([]);

      await articlesService.findbyParam({ tag: 'nestjs' } as any);

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tags: { some: { name: 'nestjs' } },
          },
        }),
      );
    });

    it('should filter by categoryId', async () => {
      prisma.article.findMany.mockResolvedValue([]);

      await articlesService.findbyParam({ categoryId: 5 } as any);

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 5 },
        }),
      );
    });

    it('should apply multiple filters together', async () => {
      prisma.article.findMany.mockResolvedValue([]);

      await articlesService.findbyParam({
        status: 'PUBLISHED',
        tag: 'nestjs',
        categoryId: 2,
      } as any);

      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PUBLISHED',
          tags: { some: { name: 'nestjs' } },
          categoryId: 2,
        },
        include: { tags: true },
      });
    });
  });

  describe('create', () => {
    it('should create new article', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      prisma.article.create.mockResolvedValue(mockArticles[0]);

      const result = await articlesService.create({
        title: 'Getting Started with Prisma',
        content:
          'Prisma is a database toolkit that makes it easy to work with databases.',
        status: Status.PUBLISHED,
        authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
        categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
        tags: [
          { name: '9c4c24fe-fbf5-4c3b-83b5-d521de708340' },
          { name: 'bc12d166-0a77-45aa-aae2-edee0f67cd6a' },
        ],
      } as any);

      expect(prisma.article.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toStrictEqual(resultArticles[0]);
    });

    it('should throw error when creating new article by invalid status', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      prisma.article.create.mockResolvedValue(mockArticles[0]);

      expect(
        articlesService.create({
          title: 'Getting Started with Prisma',
          content:
            'Prisma is a database toolkit that makes it easy to work with databases.',
          status: 'INVALID_STATUS',
          authorId: '9e152776-2e6d-4f43-8328-19f2ebd6fa34',
          categoryId: '5cd11c17-3030-4289-bd21-b47d4408e2d3',
          tags: [
            { name: '9c4c24fe-fbf5-4c3b-83b5-d521de708340' },
            { name: 'bc12d166-0a77-45aa-aae2-edee0f67cd6a' },
          ],
        } as any),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.article.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update article', async () => {
      prisma.article.findUnique.mockResolvedValue(mockArticles[0]);
      prisma.article.update.mockResolvedValue({
        ...mockArticles[0],
        title: 'Updated Article Title',
        content: 'Updated article content.',
      });

      const result = await articlesService.update({
        where: { id: '9e152776-2e6d-4f43-8328-19f2ebd6fa34' },
        data: {
          title: 'Updated Article Title',
          content: 'Updated article content.',
        },
      } as any);

      expect(prisma.article.update).toHaveBeenCalled();
      expect(result).toStrictEqual({
        ...resultArticles[0],
        title: 'Updated Article Title',
        content: 'Updated article content.',
      });
    });

    it('should update article status', async () => {
      prisma.article.findUnique.mockResolvedValue(mockArticles[0]);
      prisma.article.update.mockResolvedValue({
        ...mockArticles[0],
        status: Status.PUBLISHED,
      });

      const result = await articlesService.update({
        where: { id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3v' },
        data: {
          title: 'Updated Article Title',
          content: 'Updated article content.',
          status: Status.PUBLISHED,
        },
      } as any);

      expect(prisma.article.update).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.status).toBe(Status.PUBLISHED.toLowerCase());
    });

    it('should fail by invalid status', async () => {
      prisma.article.findUnique.mockResolvedValue(mockArticles[0]);

      await expect(
        articlesService.update({
          where: { id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3v' },
          data: {
            title: 'Updated Article Title',
            content: 'Updated article content.',
            status: 'INVALID_STATUS',
          },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if article not found', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      await expect(
        articlesService.update({
          where: { id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3b' },
          data: {
            title: 'Updated Article Title',
            content: 'Updated article content.',
            status: Status.PUBLISHED,
          },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const result = await articlesService.delete({
        id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3v',
      });

      expect(prisma.article.delete).toHaveBeenCalledWith({
        where: { id: 'cdaeb4c9-f947-47c3-8b24-6c4c7bf63bf3v' },
      });

      expect(result).toBeDefined();
    });

    it('should throw if article not found', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      await expect(
        articlesService.delete({ id: '9e152776-2e6d-4f43-8328-19f2ebd6fa36' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

describe('CreateArticleDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'Test title';
    dto.content = 'Test content';
    dto.status = Status.DRAFT;
    dto.tags = ['nestjs'];

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if title is missing', async () => {
    const dto = new CreateArticleDto();
    dto.content = 'content';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail if content is empty', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'title';
    dto.content = '';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow missing optional fields', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'title';
    dto.content = 'content';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if tags is not array', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'title';
    dto.content = 'content';
    (dto as any).tags = 'not-array';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid status', async () => {
    const dto = new CreateArticleDto();
    dto.title = 'title';
    dto.content = 'content';
    (dto as any).status = 'INVALID';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateArticleDto', () => {
  it('should pass when empty (all fields optional)', async () => {
    const dto = new UpdateArticleDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass with partial data', async () => {
    const dto = new UpdateArticleDto();
    dto.title = 'New title';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail with invalid status', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).status = 'INVALID';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if tags is not array', async () => {
    const dto = new UpdateArticleDto();
    (dto as any).tags = 'not-array';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
