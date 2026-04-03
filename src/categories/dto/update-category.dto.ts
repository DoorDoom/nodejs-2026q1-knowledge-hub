import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Name must be string' })
  name?: string;
  @IsOptional()
  @IsString({ message: 'Description must be string' })
  description?: string;
}
