import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/roles.guard';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, { provide: APP_GUARD, useClass: RolesGuard }],
  exports: [ArticlesService],
})
export class ArticlesModule {}
