import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        ...data,
        authorId: undefined,
        author: { connect: { id: data.authorId } },
        articleId: undefined,
        article: data.articleId ? { connect: { id: data.articleId } } : null,
      } as Prisma.CommentCreateInput,
    });
  }

  findAll(articleId?: string) {
    return this.prisma.comment.findMany({
      where: {
        articleId,
      },
    });
  }

  delete(where: Prisma.CommentWhereUniqueInput) {
    return this.prisma.comment.delete({
      where,
    });
  }
}
