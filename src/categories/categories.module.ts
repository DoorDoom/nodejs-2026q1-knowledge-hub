import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/roles.guard';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class CategoriesModule {}
