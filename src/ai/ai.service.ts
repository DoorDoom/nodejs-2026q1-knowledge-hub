import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status, SummarizeArticleDto } from './dto/summarize-article.dto';
import { GoogleGenAI } from '@google/genai';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleDto, Task } from './dto/analyze-article.dto';
import {
  analysisTemplate,
  simpleTemplate,
  summarizeTemplate,
  translateTemplate,
} from './templates/prompt-templates';
import { IndexArticleDto } from './dto/indexing-article.dto';
import { GeminiAiService } from 'src/gemini-ai.service';
import { RagService } from 'src/rag/rag.service';

@Injectable()
export class AiService {
  cacheResponse = new Map<string, string>();
  model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

  generateSummarize = async (status: Status, content: string) => {
    try {
      const response = await this.gemini.ai.models.generateContent({
        model: this.model,
        contents: summarizeTemplate(content, status),
      });
      return response.text;
    } catch (error: any) {
      if (error?.status === 429) {
        throw new NotAcceptableException('AI rate limit exceeded');
      }

      if (error?.status === 400) {
        throw new BadRequestException('Invalid AI request');
      }

      if (error?.status === 403) {
        throw new ForbiddenException('AI access denied (check API key)');
      }

      if (error?.status === 503) {
        throw new ServiceUnavailableException('AI service anavailable');
      }

      throw new InternalServerErrorException('AI service failed');
    }
  };

  generateAnalysis = async (task: Task, content: string) => {
    try {
      const response = await this.gemini.ai.models.generateContent({
        model: this.model,
        contents: analysisTemplate(content, task || 'review'),
      });

      const obj = JSON.parse(response.text);
      return {
        analysis: obj.analysis,
        suggestions: obj.suggestions,
        severity: obj.severity,
      };
    } catch (error: any) {
      if (error?.status === 429) {
        throw new NotAcceptableException('AI rate limit exceeded');
      }

      if (error?.status === 400) {
        throw new BadRequestException('Invalid AI request');
      }

      if (error?.status === 403) {
        throw new ForbiddenException('AI access denied (check API key)');
      }

      if (error?.status === 503) {
        throw new ServiceUnavailableException('AI service anavailable');
      }

      throw new InternalServerErrorException('AI service failed');
    }
  };

  generateTranslation = async (
    targetLang: string,
    content: string,
    sourceLanguage?: string,
  ) => {
    try {
      const response = await this.gemini.ai.models.generateContent({
        model: this.model,
        contents: translateTemplate(content, targetLang, sourceLanguage),
      });
      return response.text;
    } catch (error: any) {
      if (error?.status === 429) {
        throw new NotAcceptableException('AI rate limit exceeded');
      }

      if (error?.status === 400) {
        throw new BadRequestException('Invalid AI request');
      }

      if (error?.status === 403) {
        throw new ForbiddenException('AI access denied (check API key)');
      }

      if (error?.status === 503) {
        throw new ServiceUnavailableException('AI service anavailable');
      }

      throw new InternalServerErrorException('AI service failed');
    }
  };

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiAiService,
    private ragService: RagService,
  ) {}

  async summarize(
    articleWhereUniqueInput: Prisma.ArticleWhereUniqueInput,
    summarizeArticleDto: SummarizeArticleDto,
  ) {
    const article = await this.prisma.article.findUnique({
      where: articleWhereUniqueInput,
      include: {
        tags: true,
      },
    });
    if (!article) throw new NotFoundException('Article not found');

    const key = `${articleWhereUniqueInput.id}:${summarizeArticleDto.status || 'medium'}:${article.updatedAt}`;
    const cachedResponse = this.cacheResponse.get(key);
    if (cachedResponse) return JSON.parse(cachedResponse);

    const summary = await this.generateSummarize(
      summarizeArticleDto.status || 'medium',
      article.content,
    );
    const response = {
      articleId: articleWhereUniqueInput.id,
      summary,
      originalLength: article.content.length,
      summaryLength: summary.length,
    };

    this.cacheResponse.set(key, JSON.stringify(response));

    return response;
  }

  async translate(
    articleWhereUniqueInput: Prisma.ArticleWhereUniqueInput,
    translateArticleDto: TranslateArticleDto,
  ) {
    const article = await this.prisma.article.findUnique({
      where: articleWhereUniqueInput,
      include: {
        tags: true,
      },
    });
    if (!article) throw new NotFoundException('Article not found');

    const key = `${articleWhereUniqueInput.id}:${translateArticleDto.targetLanguage}:${translateArticleDto.sourceLanguage}:${article.updatedAt}`;
    const cachedResponse = this.cacheResponse.get(key);
    if (cachedResponse) return JSON.parse(cachedResponse);

    const translatedText = await this.generateTranslation(
      translateArticleDto.targetLanguage,
      article.content,
      translateArticleDto.sourceLanguage,
    );

    const response = {
      articleId: articleWhereUniqueInput.id,
      translatedText,
      detectedLanguage: translateArticleDto.targetLanguage,
    };

    this.cacheResponse.set(key, JSON.stringify(response));

    return response;
  }

  async generate() {
    const response = await this.gemini.ai.models.generateContent({
      model: this.model,
      contents: simpleTemplate(),
    });

    return { text: response.text };
  }

  async analyze(
    articleWhereUniqueInput: Prisma.ArticleWhereUniqueInput,
    analyzeArticleDto: AnalyzeArticleDto,
  ) {
    const article = await this.prisma.article.findUnique({
      where: articleWhereUniqueInput,
      include: {
        tags: true,
      },
    });
    if (!article) throw new NotFoundException('Article not found');

    const { analysis, suggestions, severity } = await this.generateAnalysis(
      analyzeArticleDto.task,
      article.content,
    );
    return {
      articleId: articleWhereUniqueInput.id,
      analysis,
      suggestions,
      severity,
    };
  }

  async indexing(indexArticleDto: IndexArticleDto) {
    const articles = await this.prisma.article.findMany({
      include: {
        tags: true,
      },
    });

    if (!articles) return { text: 'no articles' };

    const articleTexts = articles.map((article) => article.content);

    const response = await this.ragService.embedTexts(articleTexts);

    return response;
  }
}
