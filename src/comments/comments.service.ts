import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Comment, Prisma } from 'generated/prisma/client';
import { validate } from 'uuid';

@Injectable()
export class CommentsService {
  transformComment(comment: Comment) {
    return {
      ...comment,
      createdAt: comment.createdAt.getTime(),
      updatedAt: comment.updatedAt.getTime(),
    };
  }
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCommentDto) {
    if (!validate(data.articleId)) {
      throw new BadRequestException('Invalid article ID');
    }

    const articleExists = await this.prisma.article.findUnique({
      where: { id: data.articleId },
    });
    if (!articleExists) {
      throw new UnprocessableEntityException('Article not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        article: { connect: { id: data.articleId } },
        author: data.authorId ? { connect: { id: data.authorId } } : undefined,
      } as Prisma.CommentCreateInput,
    });
    return this.transformComment(comment);
  }

  async findAll(articleId?: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        articleId,
      },
    });
    return comments.map((comment) => this.transformComment(comment));
  }

  async findOne(where: Prisma.CommentWhereUniqueInput) {
    const comment = await this.prisma.comment.findFirst({
      where,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return this.transformComment(comment);
  }

  async delete(where: Prisma.CommentWhereUniqueInput) {
    const comment = await this.prisma.comment.findUnique({
      where,
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.delete({
      where,
    });
  }
}
