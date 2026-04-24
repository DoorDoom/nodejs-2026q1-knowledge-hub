import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from 'generated/prisma/enums';

export class UpdateArticleDto {
  @IsOptional()
  @IsString({ message: 'Title must be string' })
  @ApiProperty({
    description: 'Title of the article',
    example: 'How to use Swagger in NestJS',
  })
  title: string;

  @IsOptional()
  @IsString({ message: 'Content must be string' })
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
  @ApiPropertyOptional({
    description: 'Current status of the article',
    enum: Status,
    example: Status.DRAFT,
  })
  @IsEnum(Status, { message: 'Invalid status' })
  status?: Status;

  @IsOptional()
  @IsArray({ message: 'Tags must be array of string' })
  @ApiPropertyOptional({
    description: 'List of tags related to the article',
    example: ['nestjs', 'swagger', 'api'],
    type: [String],
  })
  tags?: string[];
}
