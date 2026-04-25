import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/roles.guard';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, { provide: APP_GUARD, useClass: RolesGuard }],
  exports: [CommentsService],
})
export class CommentsModule {}
