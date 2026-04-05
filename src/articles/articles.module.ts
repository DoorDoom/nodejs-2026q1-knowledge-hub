import { forwardRef, Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
  imports: [forwardRef(() => CommentsModule)],
})
export class ArticlesModule {}
