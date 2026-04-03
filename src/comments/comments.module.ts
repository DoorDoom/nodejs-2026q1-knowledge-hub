import { forwardRef, Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ArticlesModule } from 'src/articles/articles.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
  imports: [forwardRef(() => ArticlesModule)],
})
export class CommentsModule {}
