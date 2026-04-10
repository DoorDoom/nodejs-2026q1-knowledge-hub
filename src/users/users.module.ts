import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CommentsModule } from 'src/comments/comments.module';
import { ArticlesModule } from 'src/articles/articles.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [CommentsModule, ArticlesModule],
})
export class UsersModule {}
