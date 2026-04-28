import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status, SummarizeArticleDto } from './dto/summarize-article.dto';
import { GoogleGenAI } from '@google/genai';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleDto, Task } from './dto/analyze-article.dto';
import {
  analysisTemplate,
  summarizeTemplate,
  translateTemplate,
} from './templates/prompt-templates';

@Injectable()
export class AiService {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

  generateSummarize = async (status: Status, content: string) => {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: summarizeTemplate(content, status),
    });
    return response.text;
  };

  generateAnalysis = async (task: Task, content: string) => {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: analysisTemplate(content, task || 'review'),
    });

    const obj = JSON.parse(response.text);
    return {
      analysis: obj.analysis,
      suggestions: obj.suggestions,
      severity: obj.severity,
    };
  };

  generateTranslation = async (
    targetLang: string,
    content: string,
    sourceLanguage?: string,
  ) => {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: translateTemplate(content, targetLang, sourceLanguage),
    });
    return response.text;
  };

  constructor(private prisma: PrismaService) {}

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

    const summary = await this.generateSummarize(
      summarizeArticleDto.status || 'medium',
      article.content,
    );
    return {
      articleId: articleWhereUniqueInput.id,
      summary,
      originalLength: article.content.length,
      summaryLength: summary.length,
    };
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

    const translatedText = await this.generateTranslation(
      translateArticleDto.targetLanguage,
      article.content,
      translateArticleDto.sourceLanguage,
    );
    return {
      articleId: articleWhereUniqueInput.id,
      translatedText,
      detectedLanguage: translateArticleDto.targetLanguage,
    };
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
}
