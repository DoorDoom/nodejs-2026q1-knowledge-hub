import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Status } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { Article, Prisma } from 'generated/prisma/client';

interface SearchParams {
  status?: Status;
  tag?: string;
  categoryId?: string;
}

@Injectable()
export class ArticlesService {
  transformArticle(article: Article) {
    return {
      ...article,
      status: article.status.toLowerCase(),
      createdAt: article.createdAt.getTime(),
      updatedAt: article.updatedAt.getTime(),
    };
  }

  constructor(private prisma: PrismaService) {}

  async create(data: CreateArticleDto) {
    if (!Object.values(Status).includes(data.status?.toUpperCase() as Status)) {
      throw new BadRequestException('Invalid status');
    }
    const article = await this.prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        status: data.status.toUpperCase() as Status,

        author: data.authorId ? { connect: { id: data.authorId } } : undefined,

        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : undefined,

        tags: {
          connectOrCreate:
            data.tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })) ?? [],
        },
      },
      include: {
        tags: true,
      },
    });

    return {
      ...this.transformArticle(article),
      tags: article.tags.map((tag) => tag.name),
    };
  }

  async findAll() {
    const articles = await this.prisma.article.findMany({
      include: {
        tags: true,
      },
    });
    return articles.map((article) => ({
      ...this.transformArticle(article),
      tags: article.tags.map((tag) => tag.name),
    }));
  }

  async findbyParam(searchParams: SearchParams) {
    const articles = await this.prisma.article.findMany({
      where: {
        ...(searchParams.status && { status: searchParams.status }),
        ...(searchParams.tag && { tags: { some: { name: searchParams.tag } } }),
        ...(searchParams.categoryId && { categoryId: searchParams.categoryId }),
      },
      include: {
        tags: true,
      },
    });
    return articles.map((article) => ({
      ...this.transformArticle(article),
      tags: article.tags.map((tag) => tag.name),
    }));
  }

  async findOne(articleWhereUniqueInput: Prisma.ArticleWhereUniqueInput) {
    const article = await this.prisma.article.findUnique({
      where: articleWhereUniqueInput,
      include: {
        tags: true,
      },
    });
    if (!article) throw new NotFoundException('Article not found');
    return {
      ...this.transformArticle(article),
      tags: article.tags.map((tag) => tag.name),
    };
  }

  async update(params: {
    where: Prisma.ArticleWhereUniqueInput;
    data: UpdateArticleDto;
  }) {
    const { where, data } = params;
    const article = await this.prisma.article.findUnique({ where });
    if (!article) throw new NotFoundException('Article not found');

    if (!Object.values(Status).includes(data.status?.toUpperCase() as Status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedArticle = await this.prisma.article.update({
      data: {
        title: data.title,
        content: data.content,
        status: data.status?.toUpperCase() as Status,
        author: data.authorId
          ? { connect: { id: data.authorId } }
          : article.authorId
            ? { connect: { id: article.authorId } }
            : undefined,
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : article.categoryId
            ? { connect: { id: article.categoryId } }
            : undefined,
        tags: {
          connectOrCreate:
            data.tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })) || [],
        },
      } as Prisma.ArticleUpdateInput,
      where,
      include: {
        tags: true,
      },
    });

    return this.transformArticle(updatedArticle);
  }

  async delete(where: Prisma.ArticleWhereUniqueInput): Promise<Article> {
    const article = await this.prisma.article.findUnique({ where });
    if (!article) throw new NotFoundException('Article not found');
    return this.prisma.article.delete({
      where,
    });
  }
}
