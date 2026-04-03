import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-article.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class UpdateArticleDto {
  @IsOptional()
  @IsString({ message: 'Title must be string' })
  title: string;
  @IsOptional()
  @IsString({ message: 'Content must be string' })
  content: string;
  @IsOptional()
  authorId?: string;
  @IsOptional()
  categoryId?: string;
  @IsOptional()
  status?: ArticleStatus;
  @IsOptional()
  @IsArray({ message: 'Tags must be array of string' })
  tags?: string[];
}
