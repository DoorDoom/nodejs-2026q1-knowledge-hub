import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { ArticlesService } from 'src/articles/articles.service';

@Injectable()
export class CommentsService {
  comments: Comment[] = [];

  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  create(createCommentDto: CreateCommentDto) {
    const comment = new Comment(createCommentDto);

    try {
      this.articlesService.findOne(comment.articleId);
    } catch (err) {
      throw new UnprocessableEntityException('No such article');
    }

    this.comments.push(comment);

    return comment;
  }

  findAll(articleId?: string) {
    return this.comments.filter((comment) => comment.articleId === articleId);
  }

  removeByAuthor(authorId: string) {
    this.comments = this.comments.filter(
      (comment) => comment.authorId !== authorId,
    );
    return this.comments;
  }

  removeByArticle(articleId: string) {
    this.comments = this.comments.filter(
      (comment) => comment.articleId !== articleId,
    );
    return this.comments;
  }

  remove(id: string) {
    const comment = this.comments.findIndex((comment) => comment.id === id);
    if (comment === -1) throw new NotFoundException('Comment not found');
    return this.comments.splice(comment, 1);
  }
}
