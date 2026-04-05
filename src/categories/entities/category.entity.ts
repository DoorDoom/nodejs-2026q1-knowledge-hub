import { randomUUID } from 'crypto';
import { CreateCategoryDto } from '../dto/create-category.dto';

export class Category {
  id: string;
  name: string;
  description: string;

  constructor(createCategoryDto: CreateCategoryDto) {
    this.id = randomUUID();
    this.name = createCategoryDto.name;
    this.description = createCategoryDto.description;
  }
}
