import { randomUUID } from 'crypto';
import { CreateCommentDto } from '../dto/create-comment.dto';

export class Comment {
  id: string;
  content: string;
  articleId: string;
  authorId: string | null;
  createdAt: number;

  constructor(createUserDto: CreateCommentDto) {
    this.id = randomUUID();
    this.content = createUserDto.content;
    this.articleId = createUserDto.articleId;
    this.authorId = createUserDto.authorId ?? null;
    this.createdAt = Date.now();
  }
}
