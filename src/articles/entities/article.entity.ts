import { randomUUID } from 'crypto';
import { CreateArticleDto } from '../dto/create-article.dto';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class Article {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;

  constructor(createArticleDto: CreateArticleDto) {
    this.id = randomUUID();
    this.title = createArticleDto.title;
    this.content = createArticleDto.content;
    this.status = createArticleDto.status ?? ArticleStatus.DRAFT;
    this.tags = createArticleDto.tags ?? [];
    this.authorId = createArticleDto.authorId ?? null;
    this.categoryId = createArticleDto.categoryId ?? null;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
}
