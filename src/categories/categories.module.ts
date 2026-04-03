import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ArticlesModule } from 'src/articles/articles.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [ArticlesModule],
})
export class CategoriesModule {}
