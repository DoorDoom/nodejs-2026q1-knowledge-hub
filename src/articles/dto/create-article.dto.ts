import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArticleDto {
  @IsString({ message: 'Title must be string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @ApiProperty({
    description: 'Title of the article',
    example: 'How to use Swagger in NestJS',
  })
  title: string;
  @IsString({ message: 'Content must be string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @ApiProperty({
    description: 'Main content of the article',
    example: 'This article explains how to configure Swagger...',
  })
  content: string;
  @IsOptional()
  @ApiPropertyOptional({
    description: 'ID of the author',
    example: '1b2e69d8-e5a3-4da7-8f0d-e64d87b14c72',
  })
  authorId?: string;
  @IsOptional()
  @ApiPropertyOptional({
    description: 'ID of the category',
    example: '1b2e69d8-e5a3-4da7-8f0d-e64d87b14c72',
  })
  categoryId?: string;
  @IsOptional()
  @IsEnum(ArticleStatus)
  @ApiPropertyOptional({
    description: 'Current status of the article',
    enum: ArticleStatus,
    example: ArticleStatus.DRAFT,
  })
  status?: ArticleStatus;
  @IsOptional()
  @IsArray({ message: 'Tags must be array of string' })
  @ApiPropertyOptional({
    description: 'List of tags related to the article',
    example: ['nestjs', 'swagger', 'api'],
    type: [String],
  })
  tags?: string[];
}
