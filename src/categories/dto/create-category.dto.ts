import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Name must be string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @ApiProperty({
    description: 'Name of the category',
    example: 'Technology',
  })
  name: string;

  @IsString({ message: 'Description must be string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @ApiProperty({
    description: 'Detailed description of the category',
    example:
      'All articles related to technology, programming, and software development',
  })
  description: string;
}
