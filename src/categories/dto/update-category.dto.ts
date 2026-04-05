import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Name must be string' })
  @ApiPropertyOptional({
    description: 'Name of the category',
    example: 'Technology',
  })
  name?: string;
  @IsOptional()
  @IsString({ message: 'Description must be string' })
  @ApiPropertyOptional({
    description: 'Detailed description of the category',
    example:
      'All articles related to technology, programming, and software development',
  })
  description?: string;
}
