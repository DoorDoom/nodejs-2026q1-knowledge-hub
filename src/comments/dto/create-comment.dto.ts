import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'ArticleId must be string' })
  @IsNotEmpty({ message: 'ArticleId cannot be empty' })
  articleId: string;
  @IsString({ message: 'Content must be string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  content: string;
  @IsOptional()
  authorId?: string;
}
