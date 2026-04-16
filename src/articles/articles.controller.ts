import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Status } from 'generated/prisma/enums';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('article')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR'])
  @Post()
  @ApiOperation({
    summary: 'Create article',
    description:
      'Creates a new article with title, content, optional tags, category, and status.',
  })
  @ApiResponse({ status: 201, description: 'Article successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR', 'VIEWER'])
  @Get()
  @ApiOperation({
    summary: 'Get all articles',
    description:
      'Retrieves all articles. Can filter by status, tag, or categoryId.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter articles by status',
    enum: Status,
    example: Status.PUBLISHED,
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    description: 'Filter articles by a specific tag',
    example: 'nestjs',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter articles by category UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  findAll(
    @Query('status') status: string,
    @Query('tag') tag: string,
    @Query('categoryId') categoryId: string,
  ) {
    if (status || tag || categoryId)
      return this.articlesService.findbyParam({
        status: status ? (status.toUpperCase() as Status) : undefined,
        tag,
        categoryId,
      });
    return this.articlesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR', 'VIEWER'])
  @Get(':id')
  @ApiOperation({
    summary: 'Get article by ID',
    description: 'Retrieves a single article by UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Article UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
  ) {
    return this.articlesService.findOne({ id });
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR'])
  @Put(':id')
  @ApiOperation({
    summary: 'Update article',
    description:
      'Updates an article by UUID with title, content, tags, category, and status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Article UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid UUID or validation error' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN', 'EDITOR'])
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete article',
    description: 'Deletes an article by UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Article UUID (v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 204, description: 'Article successfully deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => new BadRequestException('Invalid UUID format'),
      }),
    )
    id: string,
  ) {
    return this.articlesService.delete({ id });
  }
}
