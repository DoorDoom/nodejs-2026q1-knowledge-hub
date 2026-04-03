import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString({ message: 'Title must be string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;
  @IsString({ message: 'Content must be string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  content: string;
  @IsOptional()
  authorId?: string;
  @IsOptional()
  categoryId?: string;
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
  @IsOptional()
  @IsArray({ message: 'Tags must be array of string' })
  tags?: string[];
}
