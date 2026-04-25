import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guards/roles.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, { provide: APP_GUARD, useClass: RolesGuard }],
  imports: [],
})
export class UsersModule {}
