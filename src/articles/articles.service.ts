import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from './entities/article.entity';
import { CommentsService } from 'src/comments/comments.service';

interface SearchParams {
  status?: ArticleStatus;
  tag?: string;
  categoryId?: string;
}

@Injectable()
export class ArticlesService {
  articles: Article[] = [];

  constructor(
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
  ) {}

  create(createArticleDto: CreateArticleDto) {
    const article = new Article(createArticleDto);

    this.articles.push(article);

    return article;
  }

  findAll() {
    return this.articles;
  }

  findbyParam(searchParams: SearchParams) {
    return this.articles.filter((article) => {
      if (
        searchParams.categoryId &&
        article.categoryId !== searchParams.categoryId
      )
        return false;
      if (searchParams.status && article.status !== searchParams.status)
        return false;
      if (
        searchParams.tag &&
        article.tags.findIndex((tag) => tag === searchParams.tag) === -1
      )
        return false;
      return true;
    });
  }

  findOne(id: string) {
    const article = this.articles.find((article) => article.id === id);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  update(id: string, updateArticleDto: UpdateArticleDto) {
    const article = this.articles.find((article) => article.id === id);
    if (!article) throw new NotFoundException('Article not found');
    for (const key of Reflect.ownKeys(updateArticleDto)) {
      article[key] = updateArticleDto[key];
    }
    article.updatedAt = Date.now();
    return article;
  }

  remove(id: string) {
    const article = this.articles.findIndex((article) => article.id === id);
    if (article === -1) throw new NotFoundException('Article not found');
    // this.commentsService
    //   .findAll(this.articles[article].id)
    //   .forEach((comment) => this.commentsService.remove(comment.id));
    // console.log(this.commentsService.findAll(id));
    return this.articles.splice(article, 1);
  }

  removeAuthor(authorId: string) {
    this.articles.forEach((article) => {
      if (article.authorId === authorId) article.authorId = null;
    });
    return this.articles;
  }
}
