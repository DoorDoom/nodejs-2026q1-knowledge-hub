import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(private prisma: PrismaService) {}

  create(data: CreateArticleDto) {
    return this.prisma.article.create({
      data: {
        ...data,
        authorId: undefined,
        author: { connect: { id: data.authorId } },
        categoryId: undefined,
        category: data.categoryId ? { connect: { id: data.categoryId } } : null,
        tags: {
          connectOrCreate:
            data.tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })) || [],
        },
      } as Prisma.ArticleCreateInput,
      include: {
        tags: true,
      },
    });
  }

  findAll() {
    return this.prisma.article.findMany({
      include: {
        tags: true,
      },
    });
  }

  findbyParam(searchParams: SearchParams) {
    return this.prisma.article.findMany({
      where: {
        ...(searchParams.status && { status: searchParams.status }),
        ...(searchParams.tag && { tags: { some: { name: searchParams.tag } } }),
        ...(searchParams.categoryId && { categoryId: searchParams.categoryId }),
      },
      include: {
        tags: true,
      },
    });
  }

  findOne(articleWhereUniqueInput: Prisma.ArticleWhereUniqueInput) {
    return this.prisma.article.findUnique({
      where: articleWhereUniqueInput,
      include: {
        tags: true,
      },
    });
  }

  async update(params: {
    where: Prisma.ArticleWhereUniqueInput;
    data: UpdateArticleDto;
  }): Promise<Article> {
    const { where, data } = params;
    const article = await this.prisma.article.findUnique({ where });
    if (!article) throw new NotFoundException('Article not found');

    return this.prisma.article.update({
      data: {
        ...data,
        updatedAt: new Date(),
        authorId: undefined,
        author: data.authorId
          ? { connect: { id: data.authorId } }
          : article.authorId
            ? { connect: { id: article.authorId } }
            : null,
        categoryId: undefined,
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : article.categoryId
            ? { connect: { id: article.categoryId } }
            : null,
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
  }

  async delete(where: Prisma.ArticleWhereUniqueInput): Promise<Article> {
    return this.prisma.article.delete({
      where,
    });
  }

  // removeAuthor(authorId: string) {
  //   this.articles.forEach((article) => {
  //     if (article.authorId === authorId) article.authorId = null;
  //   });
  //   return this.articles;
  // }
}
