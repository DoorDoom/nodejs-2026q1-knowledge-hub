import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Name must be string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;
  @IsString({ message: 'Description must be string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description: string;
}
