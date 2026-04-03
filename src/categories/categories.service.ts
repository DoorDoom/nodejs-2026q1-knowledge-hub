import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { ArticlesService } from 'src/articles/articles.service';

@Injectable()
export class CategoriesService {
  categories: Category[] = [];

  constructor(private readonly articlesService: ArticlesService) {}
  create(createCategoryDto: CreateCategoryDto) {
    const category = new Category(createCategoryDto);

    this.categories.push(category);

    return category;
  }

  findAll() {
    return this.categories;
  }

  findOne(id: string) {
    const category = this.categories.find((category) => category.id === id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = this.categories.find((category) => category.id === id);
    if (!category) throw new NotFoundException('Category not found');
    for (const key of Reflect.ownKeys(updateCategoryDto)) {
      category[key] = updateCategoryDto[key];
    }
    return category;
  }

  remove(id: string) {
    const category = this.categories.findIndex(
      (category) => category.id === id,
    );
    if (category === -1) throw new NotFoundException('Category not found');
    this.articlesService
      .findbyParam({ categoryId: id })
      .forEach((article) => (article.categoryId = null));
    return this.categories.splice(category, 1);
  }
}
