import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard)
  @Post('article/:articleId/summarize')
  @HttpCode(200)
  summarize(
    @Param(
      'articleId',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
    @Body() summarizeArticleDto: SummarizeArticleDto,
  ) {
    return this.aiService.summarize({ id }, summarizeArticleDto);
  }

  @UseGuards(AuthGuard)
  @Post('article/:articleId/translate')
  @HttpCode(200)
  translate(
    @Param(
      'articleId',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
    @Body() translateArticleDto: TranslateArticleDto,
  ) {
    return this.aiService.translate({ id }, translateArticleDto);
  }

  @UseGuards(AuthGuard)
  @Post('article/:articleId/analyze')
  @HttpCode(200)
  analyze(
    @Param(
      'articleId',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
    @Body() analyzeArticleDto: AnalyzeArticleDto,
  ) {
    return this.aiService.analyze({ id }, analyzeArticleDto);
  }

  @UseGuards(AuthGuard)
  @Post('generate')
  @HttpCode(200)
  generate() {
    return this.aiService.generate();
  }
}
