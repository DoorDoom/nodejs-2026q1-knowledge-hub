import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @IsString({ message: 'ArticleId must be string' })
  @IsNotEmpty({ message: 'ArticleId cannot be empty' })
  @ApiProperty({
    description: 'ID of the article this comment belongs to',
    example: '1b2e69d8-e5a3-4da7-8f0d-e64d87b14c72',
  })
  articleId: string;
  @IsString({ message: 'Content must be string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @ApiProperty({
    description: 'Content of the comment',
    example: 'This is a very insightful article, thanks for sharing!',
  })
  content: string;
  @IsOptional()
  @ApiPropertyOptional({
    description: 'ID of the author who wrote the comment',
    example: '1b2e69d8-e5a3-4da7-8f0d-e64d87b14c72',
  })
  authorId?: string;
}
