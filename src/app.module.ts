import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    CommentsModule,
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    AiModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(Number(process.env.AI_CACHE_TTL_SEC) || 300),
          limit: Number(process.env.AI_RATE_LIMIT_RPM) || 20,
        },
      ],
      errorMessage: 'too many requests!',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
